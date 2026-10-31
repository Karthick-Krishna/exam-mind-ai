import { NextRequest, NextResponse } from "next/server";
import { addMessage, createConversation, getConversation, getDefaultUser, recordLearningActivity } from "@/lib/database/db";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { executeMultiModelStream, routePromptToModel } from "@/lib/ai/model-adapter";
import { formatRetrievedContext, retrieveRelevantPassages, shouldPerformRag } from "@/lib/rag/retrieval";
import { classifySearchIntent, fetchRealtimeEducationalData } from "@/lib/rag/realtime-search";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId: incomingConvId,
      messages = [],
      prompt,
      mode = "DEEP_SEARCH",
      documentIds = [],
      model,
      regenerate = false,
      requestId,
    } = body;

    const user = await getDefaultUser();
    let conversationId = incomingConvId;

    const lastUserPrompt = prompt || messages.filter((m: { role: string }) => m.role === "user").pop()?.content || "";
    if (!lastUserPrompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Create or retrieve conversation
    if (!conversationId) {
      const title = lastUserPrompt.length > 40 ? lastUserPrompt.substring(0, 40) + "..." : lastUserPrompt;
      const newConv = await createConversation({
        userId: user.id,
        title,
        teachingMode: mode,
      });
      conversationId = newConv.id;
    } else {
      const existing = await getConversation(conversationId);
      if (!existing) {
        await createConversation({
          userId: user.id,
          title: lastUserPrompt.substring(0, 35),
          teachingMode: mode,
        });
      }
    }

    // 1. Save user message to DB (unless this is a regeneration of the previous response)
    if (!regenerate) {
      await addMessage({
        conversationId,
        role: "user",
        content: lastUserPrompt,
      });
    }

    // 2. Intelligent Knowledge Source Determination (Requirement 3):
    // - Stable general questions (photosynthesis, OS, LMVT, prime number program) -> Model Pretrained Knowledge directly!
    // - Time-sensitive / current facts (Chief Minister of Tamil Nadu, latest versions) -> Live Web Search across all sites.
    // - Internal documents / uploaded textbooks -> RAG Knowledge Retrieval.
    const searchIntent = classifySearchIntent(lastUserPrompt, mode);
    const isRagNeeded = shouldPerformRag(lastUserPrompt, documentIds);

    const retrievalPromises: [Promise<any[]>, Promise<any[]>] = [
      isRagNeeded
        ? retrieveRelevantPassages(
            lastUserPrompt,
            documentIds.length > 0 ? documentIds : undefined,
            3
          )
        : Promise.resolve([]),
      searchIntent.needsLiveSearch
        ? fetchRealtimeEducationalData(lastUserPrompt, mode)
        : Promise.resolve([]),
    ];

    const [retrievedPassages, realtimeData] = await Promise.all(retrievalPromises);

    let combinedKnowledgeContext = "";
    const citations: any[] = [];
    const knowledgeSources: string[] = ["Pretrained Knowledge"];

    // Add textbook citations if genuine RAG was performed
    if (retrievedPassages.length > 0) {
      knowledgeSources.push("Document RAG");
      combinedKnowledgeContext += "--- COURSE TEXTBOOK SOURCES ---\n" + formatRetrievedContext(retrievedPassages) + "\n\n";
      retrievedPassages.forEach((p) => {
        citations.push(p.citation);
      });
    }

    // Add real-time live web & Google search data scraped across the web
    if (realtimeData.length > 0) {
      knowledgeSources.push("Live Web Search");
      combinedKnowledgeContext += "--- REAL-TIME LIVE RESEARCH & SCRAPED WEB DATA ---\n";
      realtimeData.forEach((item, i) => {
        const domainStr = item.domain ? ` [${item.domain}]` : "";
        combinedKnowledgeContext += `[Live Source ${i + 1}: ${item.sourceType}${domainStr} - "${item.title}"]\n${item.snippet}\n${
          item.scrapedContent ? `Scraped Page Text Extract:\n${item.scrapedContent}\n` : ""
        }Link: ${item.sourceUrl}\n\n`;
        citations.push({
          documentName: `${item.sourceType}${domainStr}: ${item.title}`,
          pageNumber: 1,
          section: item.domain || "Live Web",
          excerpt: item.snippet,
          confidenceScore: 98,
          sourceUrl: item.sourceUrl,
        });
      });
    }

    // 3. Assemble pedagogical system prompt with response mode and knowledge context
    const systemInstruction = buildSystemPrompt({
      mode,
      documentContext: combinedKnowledgeContext,
    });

    const chatHistory = [
      { role: "system" as const, content: systemInstruction },
      ...messages
        .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map((m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
    ];

    if (!chatHistory.some((m) => m.content === lastUserPrompt)) {
      chatHistory.push({ role: "user", content: lastUserPrompt });
    }

    // 4. Intelligent Backend Model Routing & Controlled Fallback (Requirement 1 & 2):
    // - Programming, code debugging, math & complex technical reasoning -> Qwen 2.5
    // - General knowledge, academic explanations, essays & deep search -> GPT-OSS
    // - Automatic fallback if preferred backend fails
    const backendSelection = model === "qwen" || model === "qwen-oss" ? "qwen" : model === "gpt-oss" ? "gpt-oss" : "auto";
    const { stream: tokenStream, modelUsed: displayModelName } = await executeMultiModelStream(chatHistory, {
      mode,
      backend: backendSelection,
    });

    // Track learning activity asynchronously
    recordLearningActivity({
      userId: user.id,
      subject: "Academic Exploration",
      topic: lastUserPrompt.substring(0, 30),
      scoreGain: 2,
    }).catch(console.error);

    // Stream to client with SSE headers and persist exactly ONE assistant message when complete
    const decoder = new TextDecoder();
    let accumulatedText = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        accumulatedText += decoder.decode(chunk, { stream: true });
        controller.enqueue(chunk);
      },
      async flush() {
        try {
          await addMessage({
            conversationId,
            role: "assistant",
            content: accumulatedText,
            citations: citations.length > 0 ? citations : undefined,
            tokensUsed: Math.ceil(accumulatedText.length / 4),
            modelUsed: displayModelName,
          });
        } catch (e) {
          console.error("Failed to persist assistant message:", e);
        }
      },
    });

    return new Response(tokenStream.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": conversationId,
        "X-Model-Used": displayModelName,
        "X-Citations": encodeURIComponent(JSON.stringify(citations)),
        "X-Knowledge-Sources": encodeURIComponent(JSON.stringify(knowledgeSources)),
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Inference failed" }, { status: 500 });
  }
}

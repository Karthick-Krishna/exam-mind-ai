import { NextRequest, NextResponse } from "next/server";
import { addMessage, createConversation, getConversation, getDefaultUser, recordLearningActivity } from "@/lib/database/db";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { createChatCompletionStream, selectDualAiModel } from "@/lib/ai/model-adapter";
import { formatRetrievedContext, retrieveRelevantPassages } from "@/lib/rag/retrieval";
import { fetchRealtimeEducationalData, isRealtimeInformationNeeded } from "@/lib/rag/realtime-search";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId: incomingConvId,
      messages = [],
      prompt,
      mode = "QUICK_ANSWER",
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

    // 2. Dual AI Model Dispatch & Manual Model Override:
    // - GPT 120B OSS: Used for Deep Search, Thinking, and all Coding/Programming/Math prompts
    // - Fast Academic Engine: Used for Quick Answer & Basic Tasks
    // - Explicit manual selection from user takes immediate precedence
    const dualModel = selectDualAiModel(lastUserPrompt, mode);
    const chosenModelId = model && model !== "auto" ? model : dualModel.modelId;
    const displayModelName =
      model === "gpt-120b-oss"
        ? "GPT 120B OSS (Manual Selection)"
        : model === "openai-fast"
        ? "GPT-OSS Fast Academic (Manual Selection)"
        : dualModel.displayName;

    // 3. Intelligent Knowledge Retrieval:
    // - Google & Live Web Search runs on ALL modes (Quick Answer, Thinking, Deep Search)
    // - In Deep Search, performs multi-pass crawling over 2-3 seconds with full citations
    const [retrievedPassages, realtimeData] = await Promise.all([
      retrieveRelevantPassages(
        lastUserPrompt,
        documentIds.length > 0 ? documentIds : undefined,
        3
      ),
      fetchRealtimeEducationalData(lastUserPrompt, mode),
    ]);

    let combinedRagContext = "";
    const citations: any[] = [];

    // Add textbook citations if relevant
    if (retrievedPassages.length > 0) {
      combinedRagContext += "--- COURSE TEXTBOOK SOURCES ---\n" + formatRetrievedContext(retrievedPassages) + "\n\n";
      retrievedPassages.forEach((p) => {
        citations.push(p.citation);
      });
    }

    // Add real-time live web & encyclopedic data
    if (realtimeData.length > 0) {
      combinedRagContext += "--- REAL-TIME LIVE RESEARCH & ENCYCLOPEDIC KNOWLEDGE ---\n";
      realtimeData.forEach((item, i) => {
        combinedRagContext += `[Live Source ${i + 1}: ${item.sourceType} - "${item.title}"]\n${item.snippet}\nLink: ${item.sourceUrl}\n\n`;
        citations.push({
          documentName: `${item.sourceType}: ${item.title}`,
          pageNumber: 1,
          section: "Live Knowledge",
          excerpt: item.snippet,
          confidenceScore: 95,
          sourceUrl: item.sourceUrl,
        });
      });
    }

    // 4. Assemble pedagogical system prompt with response mode and RAG context
    const systemInstruction = buildSystemPrompt({
      mode,
      documentContext: combinedRagContext,
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

    // 5. Create streaming response via open-source model URL API
    const tokenStream = await createChatCompletionStream(chatHistory, { model: chosenModelId });

    // Track learning progress asynchronously
    recordLearningActivity({
      userId: user.id,
      subject: "Academic Exploration",
      topic: lastUserPrompt.substring(0, 30),
      scoreGain: 2,
    }).catch(console.error);

    // Stream to client with SSE headers and persist assistant message when complete
    const decoder = new TextDecoder();
    let accumulatedText = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        accumulatedText += decoder.decode(chunk, { stream: true });
        controller.enqueue(chunk);
      },
      async flush() {
        // Persist full assistant response into DB with citations
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
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Inference failed" }, { status: 500 });
  }
}

import { saveStudyMaterial, StudyMaterial } from "@/lib/database/db";
import { generateChatCompletion } from "@/lib/ai/model-adapter";

export interface GenerateMaterialParams {
  userId: string;
  title: string;
  subject: string;
  topic: string;
  type: "NOTES" | "FLASHCARDS" | "REVISION" | "MINDMAP" | "FORMULASHEET";
  documentContext?: string;
}

export async function generateStudyMaterial(params: GenerateMaterialParams): Promise<StudyMaterial> {
  const id = "mat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

  let systemPrompt = `You are EXAM MIND AI, an elite academic AI tutor with Google Gemini-level reasoning. Your mission is to generate genuine, mathematically rigorous, pedagogy-focused academic study materials. Never use fake placeholders or generic filler. Always use proper LaTeX notation ($$...$$ for display math, $...$ for inline math).`;

  let promptInstruction = "";
  switch (params.type) {
    case "FORMULASHEET":
      promptInstruction = `Generate a rigorous, comprehensive formula sheet for Subject: "${params.subject}", Topic: "${params.topic}".
Structure:
# Formula Sheet: ${params.subject} — ${params.topic}
## 1. Core Mathematical Expressions & Governing Laws
Present a Markdown table with columns: # | Formula / Law (LaTeX) | Description | Domain / SI Units
## 2. Fundamental Constants & Standard Values
## 3. Important Identities, Boundary Limits & Conversions
Ensure all math is valid LaTeX ($$...$$ and $...$).`;
      break;

    case "FLASHCARDS":
      promptInstruction = `Generate 6 high-yield academic flashcards for Subject: "${params.subject}", Topic: "${params.topic}".
You MUST return ONLY a JSON array of objects with the exact keys:
[
  {
    "front": "Specific question or conceptual prompt",
    "back": "Precise, student-friendly explanation or solution with LaTeX if applicable",
    "tag": "Definition | Formula | Theorem | Application"
  }
]
Do not include any surrounding markdown text outside the JSON array if possible.`;
      break;

    case "MINDMAP":
      promptInstruction = `Generate a conceptual hierarchical mind map for Subject: "${params.subject}", Topic: "${params.topic}".
Format:
Start with a valid Mermaid mindmap:
\`\`\`mermaid
mindmap
  root(("${params.topic}"))
    Foundational Principles
      ...
    Mathematical Framework
      ...
    Core Mechanisms & Algorithms
      ...
    Industrial & Practical Applications
      ...
\`\`\`
Follow the diagram with a concise 3-part breakdown of the conceptual clusters.`;
      break;

    case "REVISION":
      promptInstruction = `Generate high-yield examination revision notes for Subject: "${params.subject}", Topic: "${params.topic}".
Include:
# High-Yield Exam Revision Notes: ${params.topic}
## ⚡ 5-Minute Quick Refresher
## 1. Essential Formulas & Laws You MUST Memorize
## 2. High-Frequency Exam Traps & Common Mistakes
## 3. Likely 10-Mark University Exam Questions (with solution outlines)`;
      break;

    case "NOTES":
    default:
      promptInstruction = `Generate comprehensive, structured academic lecture notes for Subject: "${params.subject}", Topic: "${params.topic}".
Include:
# Course Notes: ${params.subject} — ${params.topic}
### Abstract & Pedagogical Objective
### 1. Foundational Epistemology & First Principles
### 2. Rigorous Conceptual & Mathematical Formulations
### 3. Step-by-Step Practical Case Study / Proof / Code
### 4. Real-World Engineering or Scientific Impact`;
      break;
  }

  if (params.documentContext) {
    promptInstruction += `\n\nReference Document Context:\n${params.documentContext.substring(0, 3000)}`;
  }

  let content = "";
  try {
    const rawAiResponse = await generateChatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: promptInstruction },
    ]);

    if (params.type === "FLASHCARDS") {
      // Clean up markdown block if the model wrapped it in ```json ... ```
      const cleaned = rawAiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      try {
        JSON.parse(cleaned);
        content = cleaned;
      } catch {
        content = rawAiResponse;
      }
    } else {
      content = rawAiResponse;
    }
  } catch (error: any) {
    console.error("AI model generation for study materials failed:", error.message);
    content = `# Generation Notice\n\nUnable to generate study material via the configured AI model endpoint: **${error.message}**.\n\nPlease verify that your inference server URL is reachable in the [Admin Settings](/admin).`;
  }

  const material: StudyMaterial = {
    id,
    userId: params.userId,
    title: params.title || `${params.topic} (${params.type})`,
    type: params.type,
    subject: params.subject,
    content,
    createdAt: new Date().toISOString(),
  };

  await saveStudyMaterial(material);
  return material;
}

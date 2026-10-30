import { Citation, DocumentChunk, getDocumentChunks, getDocuments } from "@/lib/database/db";
import { cosineSimilarity, generateEmbedding } from "./embeddings";

export interface RetrievedChunkResult {
  chunk: DocumentChunk;
  documentName: string;
  similarityScore: number;
  citation: Citation;
}

/**
 * Retrieve the most relevant educational passages for a query using hybrid search
 */
export async function retrieveRelevantPassages(
  query: string,
  documentIds?: string[],
  topK: number = 4
): Promise<RetrievedChunkResult[]> {
  const documents = await getDocuments();
  const docMap = new Map<string, string>();
  documents.forEach((d) => docMap.set(d.id, d.name));

  const chunks = await getDocumentChunks(documentIds);
  if (chunks.length === 0) return [];

  const queryEmbedding = await generateEmbedding(query);
  const queryTokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  const scored: Array<{
    chunk: DocumentChunk;
    score: number;
    docName: string;
  }> = [];

  for (const chunk of chunks) {
    const docName = docMap.get(chunk.documentId) || "Course Material";
    
    // 1. Vector cosine similarity
    const vecScore = chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0.5;

    // 2. Lexical keyword match (BM25-style frequency)
    const contentLower = chunk.content.toLowerCase();
    let lexicalHits = 0;
    for (const token of queryTokens) {
      if (contentLower.includes(token)) {
        lexicalHits += 1;
      }
    }
    const lexicalScore = queryTokens.length > 0 ? lexicalHits / queryTokens.length : 0;

    // 3. Hybrid weighted score
    const finalScore = 0.65 * vecScore + 0.35 * lexicalScore;

    scored.push({
      chunk,
      score: finalScore,
      docName,
    });
  }

  // Sort descending by relevance
  scored.sort((a, b) => b.score - a.score);

  // Return topK results formatted with citations
  return scored.slice(0, topK).map((item) => ({
    chunk: item.chunk,
    documentName: item.docName,
    similarityScore: item.score,
    citation: {
      documentName: item.docName,
      pageNumber: item.chunk.pageNumber,
      section: item.chunk.sectionTitle,
      excerpt: item.chunk.content.slice(0, 320) + "...",
      confidenceScore: Math.round(item.score * 100),
    },
  }));
}

/**
 * Format retrieved passages into prompt context
 */
export function formatRetrievedContext(results: RetrievedChunkResult[]): string {
  if (results.length === 0) return "";

  return results
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.documentName} | Page ${r.chunk.pageNumber} | §${r.chunk.sectionTitle || "Overview"}]\n${r.chunk.content}`
    )
    .join("\n\n");
}

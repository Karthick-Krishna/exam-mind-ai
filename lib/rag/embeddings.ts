/**
 * Vector Embeddings Service
 * Supports remote OpenAI-compatible embedding models (e.g. text-embedding-3-small, BAAI/bge-large-en-v1.5)
 * and an ultra-fast high-dimensional vector hashing fallback for deterministic offline/local semantic similarity.
 */

const VECTOR_DIMENSION = 384;

export async function generateEmbedding(text: string): Promise<number[]> {
  const baseUrl = process.env.INFERENCE_BASE_URL;
  const apiKey = process.env.INFERENCE_API_KEY || "";
  const embeddingModel = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

  // Check if remote embedding API is available
  if (baseUrl && apiKey) {
    try {
      const endpoint = `${baseUrl.replace(/\/+$/, "")}/embeddings`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: text.slice(0, 4000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const embedding = data?.data?.[0]?.embedding;
        if (Array.isArray(embedding)) {
          return embedding;
        }
      }
    } catch (e) {
      console.warn("External embedding service failed, falling back to local vectorizer:", e);
    }
  }

  // High-dimensional semantic feature hashing with n-gram positional weighting
  return computeDeterministicVector(text, VECTOR_DIMENSION);
}

/**
 * Computes a normalized high-dimensional semantic feature vector
 */
function computeDeterministicVector(text: string, dim: number): number[] {
  const vector = new Array(dim).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = clean.split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Hash unigrams
    let h1 = fnv1a(word);
    let idx1 = Math.abs(h1) % dim;
    vector[idx1] += 1.0;

    // Hash character trigrams for morphological similarity
    for (let j = 0; j <= word.length - 3; j++) {
      const tri = word.slice(j, j + 3);
      let hTri = fnv1a(tri);
      let idxTri = Math.abs(hTri) % dim;
      vector[idxTri] += 0.35;
    }

    // Hash bigrams for semantic context
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let h2 = fnv1a(bigram);
      let idx2 = Math.abs(h2) % dim;
      vector[idx2] += 0.75;
    }
  }

  // L2 Normalize
  let norm = 0;
  for (let v of vector) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return vector.map((v) => v / norm);
}

function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash;
}

/**
 * Calculate Cosine Similarity between two normalized vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, (dotProduct + 1) / 2));
}

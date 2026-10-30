import { Document, DocumentChunk, saveDocument } from "@/lib/database/db";
import { generateEmbedding } from "./embeddings";

export interface ProcessedDocumentResult {
  document: Document;
  chunksCount: number;
}

/**
 * Extracts clean textual content and page counts from a file buffer
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: string
): Promise<{ text: string; pageCount: number }> {
  const ext = fileType.toLowerCase().replace(/^\./, "");

  if (ext === "pdf") {
    try {
      // Dynamic import to prevent bundler SSR issues
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      return {
        text: pdfData.text || "",
        pageCount: Math.max(1, pdfData.numpages || 1),
      };
    } catch (err: any) {
      console.warn("PDF binary parsing fallback:", err.message);
      // Fallback: extract ASCII characters
      const asciiText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
      return {
        text: asciiText,
        pageCount: Math.max(1, Math.ceil(asciiText.length / 2200)),
      };
    }
  }

  // Plain text, markdown, CSV, JSON
  const rawText = buffer.toString("utf-8");
  return {
    text: rawText,
    pageCount: Math.max(1, Math.ceil(rawText.length / 2200)),
  };
}

/**
 * Ingest and process an uploaded educational document
 */
export async function ingestDocument(params: {
  userId: string;
  name: string;
  fileType: string;
  fileSize: number;
  textContent: string;
  explicitPageCount?: number;
}): Promise<ProcessedDocumentResult> {
  const docId = "doc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  
  const rawText = params.textContent.trim();
  const pageCount = params.explicitPageCount || Math.max(1, Math.ceil(rawText.length / 2200));

  const doc: Document = {
    id: docId,
    userId: params.userId,
    name: params.name,
    fileType: params.fileType,
    fileSize: params.fileSize,
    pageCount,
    status: "READY",
    createdAt: new Date().toISOString(),
  };

  // Chunk text into page-aware segments with overlap
  const chunkData = splitTextIntoPageChunks(rawText, pageCount);
  const chunks: DocumentChunk[] = [];

  for (let i = 0; i < chunkData.length; i++) {
    const item = chunkData[i];
    const chunkId = `chunk-${docId}-${i}`;
    const embedding = await generateEmbedding(item.content);

    chunks.push({
      id: chunkId,
      documentId: docId,
      chunkIndex: i,
      pageNumber: item.pageNumber,
      sectionTitle: item.sectionTitle,
      content: item.content,
      embedding,
      createdAt: new Date().toISOString(),
    });
  }

  await saveDocument(doc, chunks);

  return {
    document: doc,
    chunksCount: chunks.length,
  };
}

interface RawChunk {
  content: string;
  pageNumber: number;
  sectionTitle?: string;
}

function splitTextIntoPageChunks(text: string, totalPages: number): RawChunk[] {
  const chunks: RawChunk[] = [];
  const lines = text.split("\n");
  
  let currentChunk = "";
  let currentSection = "Course Notes";
  let charCounter = 0;
  const targetChunkSize = 750;
  const overlapSize = 120;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect chapter / section header
    if (
      trimmed.startsWith("#") ||
      trimmed.match(/^(chapter|section|part|unit|\d+\.\d+)\b/i) ||
      (trimmed.length < 50 && trimmed.toUpperCase() === trimmed && /[A-Z]/.test(trimmed))
    ) {
      currentSection = trimmed.replace(/^#+\s*/, "");
    }

    currentChunk += trimmed + " ";
    charCounter += trimmed.length;

    if (currentChunk.length >= targetChunkSize) {
      const estimatedPage = Math.min(totalPages, Math.max(1, Math.ceil(charCounter / 2200)));
      chunks.push({
        content: currentChunk.trim(),
        pageNumber: estimatedPage,
        sectionTitle: currentSection,
      });

      // Maintain overlap
      currentChunk = currentChunk.slice(-overlapSize);
    }
  }

  if (currentChunk.trim().length > 30) {
    const estimatedPage = Math.min(totalPages, Math.max(1, Math.ceil(charCounter / 2200)));
    chunks.push({
      content: currentChunk.trim(),
      pageNumber: estimatedPage,
      sectionTitle: currentSection,
    });
  }

  return chunks;
}

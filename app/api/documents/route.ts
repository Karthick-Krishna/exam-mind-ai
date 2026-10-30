import { NextRequest, NextResponse } from "next/server";
import { deleteDocument, getDefaultUser, getDocuments } from "@/lib/database/db";
import { extractTextFromBuffer, ingestDocument } from "@/lib/rag/ingestion";

export async function GET() {
  try {
    const user = await getDefaultUser();
    const documents = await getDocuments(user.id);
    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDefaultUser();
    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart/form-data (actual file upload: PDF, TXT, MD, CSV)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      const fileName = file.name;
      const fileType = fileName.split(".").pop() || "txt";
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text and page count with pdf-parse
      const { text, pageCount } = await extractTextFromBuffer(buffer, fileType);

      if (!text.trim()) {
        return NextResponse.json({ error: "Extracted file content was empty" }, { status: 400 });
      }

      const result = await ingestDocument({
        userId: user.id,
        name: fileName,
        fileType,
        fileSize: file.size,
        textContent: text,
        explicitPageCount: pageCount,
      });

      return NextResponse.json({
        success: true,
        document: result.document,
        chunksCount: result.chunksCount,
      });
    }

    // 2. Handle application/json (manual title & text paste)
    const body = await req.json();
    const { name, textContent, fileType = "txt", fileSize = 1024 } = body;

    if (!name || !textContent) {
      return NextResponse.json(
        { error: "Document name and text content are required" },
        { status: 400 }
      );
    }

    const result = await ingestDocument({
      userId: user.id,
      name,
      fileType,
      fileSize: fileSize || textContent.length,
      textContent,
    });

    return NextResponse.json({
      success: true,
      document: result.document,
      chunksCount: result.chunksCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing document id" }, { status: 400 });

    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

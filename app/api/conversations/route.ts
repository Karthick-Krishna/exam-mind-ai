import { NextRequest, NextResponse } from "next/server";
import { createConversation, getConversations, getDefaultUser, updateConversation } from "@/lib/database/db";

export async function GET() {
  try {
    const user = await getDefaultUser();
    const conversations = await getConversations(user.id);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDefaultUser();
    const body = await req.json().catch(() => ({}));
    const conv = await createConversation({
      userId: user.id,
      title: body.title || "New Academic Chat",
      category: body.category || "General Academic",
      teachingMode: body.teachingMode || "DETAILED_EXPLANATION",
      academicLevel: body.academicLevel || user.academicLevel,
    });
    return NextResponse.json({ conversation: conv });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });

    const updated = await updateConversation(id, updates);
    return NextResponse.json({ conversation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

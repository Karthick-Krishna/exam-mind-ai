import { NextRequest, NextResponse } from "next/server";
import { deleteStudyMaterial, getDefaultUser, getStudyMaterials } from "@/lib/database/db";
import { generateStudyMaterial } from "@/lib/education/study-materials";

export async function GET() {
  try {
    const user = await getDefaultUser();
    const materials = await getStudyMaterials(user.id);
    return NextResponse.json({ materials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDefaultUser();
    const body = await req.json();
    const { title, subject = "Mathematics", topic = "Linear Algebra", type = "NOTES" } = body;

    const material = await generateStudyMaterial({
      userId: user.id,
      title: title || `${topic} (${type})`,
      subject,
      topic,
      type,
    });

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing material ID" }, { status: 400 });

    await deleteStudyMaterial(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDefaultUser, getQuiz, getQuizAttempts, getQuizzes } from "@/lib/database/db";
import { evaluateQuizSubmission, generateAcademicQuiz } from "@/lib/education/assessment";

export async function GET(req: NextRequest) {
  try {
    const user = await getDefaultUser();
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("id");

    if (quizId) {
      const quiz = await getQuiz(quizId);
      if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      return NextResponse.json({ quiz });
    }

    const quizzes = await getQuizzes(user.id);
    const attempts = await getQuizAttempts(user.id);
    return NextResponse.json({ quizzes, attempts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDefaultUser();
    const body = await req.json();

    // Check if this is a quiz submission or quiz generation
    if (body.action === "submit") {
      const { quizId, userAnswers, timeTakenSeconds } = body;
      const quiz = await getQuiz(quizId);
      if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

      const attempt = await evaluateQuizSubmission({
        quiz,
        userId: user.id,
        userAnswers,
        timeTakenSeconds: timeTakenSeconds || 60,
      });

      return NextResponse.json({ success: true, attempt });
    }

    // Otherwise generate a new quiz
    const {
      subject = "Computer Science",
      topic = "Algorithms & Data Structures",
      difficulty = "Medium",
      questionCount = 5,
      academicLevel,
      sourceDocumentId,
    } = body;

    const quiz = await generateAcademicQuiz({
      userId: user.id,
      subject,
      topic,
      difficulty,
      questionCount,
      academicLevel: academicLevel || user.academicLevel,
      sourceDocumentId,
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

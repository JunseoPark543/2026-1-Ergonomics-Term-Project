import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getParticipantId, getResearcherUser } from "@/lib/api-auth";
import { saveMetacognition, saveQuizResponses, updateQuizManualScore } from "@/lib/db";
import { getQuizSet } from "@/lib/quiz-sets";

export async function POST(request: NextRequest) {
  const participantId = await getParticipantId(request);
  if (!participantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const { paperSet, memoryPercent, expectedScore, answers } = body as {
    paperSet: "vision" | "timeseries" | "optical";
    memoryPercent: number;
    expectedScore: number;
    answers: Record<string, string>;
  };

  await saveMetacognition({ participantId, paperSet, memoryPercent, expectedScore });

  const quiz = getQuizSet(paperSet);
  const rows = quiz.questions.map((q) => {
    const answer = answers[q.id] ?? "";
    if (q.type === "recognition") {
      const isCorrect = answer === String(q.answerIndex);
      return {
        participantId,
        paperSet,
        questionId: q.id,
        questionType: q.type,
        answer,
        isCorrect,
        autoScore: isCorrect ? 1 : 0
      };
    }
    return {
      participantId,
      paperSet,
      questionId: q.id,
      questionType: q.type,
      answer,
      isCorrect: null,
      autoScore: null
    };
  });

  await saveQuizResponses(rows);

  return NextResponse.json({ ok: true });
}

// PATCH: 연구자가 서술형 문항 점수 입력
export async function PATCH(request: NextRequest) {
  const researcher = await getResearcherUser(request);
  if (!researcher) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { id: string; manualScore: number } | null;
  if (!body?.id || body.manualScore == null) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  await updateQuizManualScore(body.id, body.manualScore);
  return NextResponse.json({ ok: true });
}

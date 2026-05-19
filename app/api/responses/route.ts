import { NextResponse } from "next/server";
import { saveFilteringResponse, saveSurveyResponse, getFilteringResponses } from "@/lib/db";
import { filteringResponseSchema, surveyResponseSchema } from "@/lib/schemas";
import { scoreResponse } from "@/lib/scoring";
import { getSentenceSet } from "@/lib/sentence-sets";
import type { NextRequest } from "next/server";
import type { Phase, UserResponse } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const authId = request.headers.get("x-auth-id");
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { type } = body as { type?: string };

  if (type === "filtering") {
    const { paperSet, phase, sentenceId, userResponse, userRevision, confidence, responseTimeMs } =
      body as {
        paperSet: "vision" | "timeseries";
        phase: Phase;
        sentenceId: string;
        userResponse: UserResponse;
        userRevision?: string;
        confidence: number;
        responseTimeMs?: number;
      };

    const set = getSentenceSet(paperSet, phase);
    const sentence = set.sentences.find((s) => s.id === sentenceId);
    if (!sentence) return NextResponse.json({ error: "sentence not found" }, { status: 400 });

    const { isCorrect, score } = scoreResponse(sentence, userResponse, userRevision);
    const record = filteringResponseSchema.parse({
      id: crypto.randomUUID(),
      participantId: authId,
      phase,
      sentenceId,
      errorType: sentence.errorType,
      isNoise: sentence.isNoise,
      userResponse,
      userRevision: userRevision ?? undefined,
      isCorrect,
      score,
      confidence,
      responseTimeMs,
      timestamp: new Date().toISOString()
    });

    await saveFilteringResponse(record);
    return NextResponse.json({
      isCorrect,
      score,
      explanation: sentence.isNoise ? sentence.explanation : undefined
    });
  }

  if (type === "survey") {
    const { questionId, likertScore } = body as { questionId: string; likertScore: number };
    const record = surveyResponseSchema.parse({
      id: crypto.randomUUID(),
      participantId: authId,
      questionId,
      likertScore,
      timestamp: new Date().toISOString()
    });
    await saveSurveyResponse(record);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const role = request.headers.get("x-auth-role");
  const authId = request.headers.get("x-auth-id");
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 참가자는 자신의 응답만 조회 가능
  const participantId = role === "researcher"
    ? (new URL(request.url).searchParams.get("participantId") ?? undefined)
    : authId;

  return NextResponse.json(await getFilteringResponses(participantId));
}

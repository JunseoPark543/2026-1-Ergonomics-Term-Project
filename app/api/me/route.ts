import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, updateSessionStep } from "@/lib/db";
import { getAuthContext, getResearcherUser } from "@/lib/api-auth";
import type { Session } from "@/lib/schemas";

const VALID_STEPS: Session["currentStep"][] = [
  "guide", "reading", "pre-test", "filtering", "post-test", "survey", "done"
];

export async function GET(request: NextRequest) {
  const researcher = await getResearcherUser(request);
  if (researcher) return NextResponse.json({ role: "researcher", username: researcher });

  const { participantId } = await getAuthContext(request);
  if (!participantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const session = await getSession(participantId);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  // 구버전 step(quiz/quiz-done 등)이 DB에 남아있으면 guide로 복구
  let currentStep = session.currentStep;
  if (!VALID_STEPS.includes(currentStep)) {
    currentStep = "guide";
    await updateSessionStep(participantId, "guide");
  }

  return NextResponse.json({
    role: "participant",
    participantId: session.participantId,
    currentStep,
    paperSet: session.paperSet,
    groupNum: session.groupNum
  });
}

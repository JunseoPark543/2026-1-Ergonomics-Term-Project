import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, updateSessionStep } from "@/lib/db";
import type { Session } from "@/lib/schemas";
import { getAuthContext } from "@/lib/api-auth";

const STEP_ORDER: Session["currentStep"][] = [
  "reading", "pre-test", "filtering", "post-test", "survey", "done"
];

export async function GET(request: NextRequest) {
  const { participantId } = await getAuthContext(request);
  if (!participantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const session = await getSession(participantId);
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(request: NextRequest) {
  const { participantId, isResearcher } = await getAuthContext(request);
  if (!participantId && !isResearcher) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { step?: Session["currentStep"] } | null;
  if (!body?.step || !STEP_ORDER.includes(body.step)) {
    return NextResponse.json({ error: "invalid step" }, { status: 400 });
  }

  // 참가자는 자신의 세션만, 연구자는 body에 participantId 필요
  const targetId = participantId ?? (body as { participantId?: string }).participantId;
  if (!targetId) return NextResponse.json({ error: "participantId required" }, { status: 400 });

  await updateSessionStep(targetId, body.step);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/db";
import { getAuthContext, getResearcherUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const researcher = await getResearcherUser(request);
  if (researcher) return NextResponse.json({ role: "researcher", username: researcher });

  const { participantId } = await getAuthContext(request);
  if (!participantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const session = await getSession(participantId);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  return NextResponse.json({
    role: "participant",
    participantId: session.participantId,
    currentStep: session.currentStep,
    paperSet: session.paperSet,
    groupNum: session.groupNum
  });
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  resetParticipantStep,
  deleteParticipantResponses,
  resetAllData,
  getAllSessions,
  getConceptMaps
} from "@/lib/db";
import { getResearcherUser } from "@/lib/api-auth";
import type { Session } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const researcher = await getResearcherUser(request);
  if (!researcher) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const resource = new URL(request.url).searchParams.get("resource");
  if (resource === "concept-maps") return NextResponse.json(await getConceptMaps());
  return NextResponse.json({ error: "unknown resource" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const researcher = await getResearcherUser(request);
  if (!researcher) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    action: "reset-step" | "delete-responses" | "reset-all";
    participantId?: string;
    step?: Session["currentStep"];
  } | null;

  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  if (body.action === "reset-step") {
    if (!body.participantId) return NextResponse.json({ error: "participantId required" }, { status: 400 });
    await resetParticipantStep(body.participantId, body.step ?? "reading");
    return NextResponse.json({ ok: true });
  }

  if (body.action === "delete-responses") {
    if (!body.participantId) return NextResponse.json({ error: "participantId required" }, { status: 400 });
    await deleteParticipantResponses(body.participantId);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reset-all") {
    await resetAllData();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

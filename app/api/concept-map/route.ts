import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getParticipantId } from "@/lib/api-auth";
import { saveConceptMap, setReadingCompletedAt } from "@/lib/db";

export async function POST(request: NextRequest) {
  const participantId = await getParticipantId(request);
  if (!participantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad request" }, { status: 400 });

  await Promise.all([
    saveConceptMap({
      participantId,
      paperSet: body.paperSet,
      nodeCount: body.nodeCount ?? 0,
      edgeCount: body.edgeCount ?? 0,
      editCount: body.editCount ?? 0,
      durationSec: body.durationSec ?? 0,
      graphData: { nodes: body.nodes ?? [], edges: body.edges ?? [] }
    }),
    setReadingCompletedAt(participantId)
  ]);

  return NextResponse.json({ ok: true });
}

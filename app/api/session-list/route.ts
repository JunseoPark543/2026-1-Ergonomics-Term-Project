import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllSessions } from "@/lib/db";
import { getResearcherUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const researcher = await getResearcherUser(request);
  if (!researcher) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sessions = await getAllSessions();
  return NextResponse.json(Object.fromEntries(sessions.map((s) => [s.participantId, s])));
}

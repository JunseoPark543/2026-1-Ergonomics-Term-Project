import { NextResponse } from "next/server";
import { getAllSessions } from "@/lib/db";

export async function GET() {
  const sessions = await getAllSessions();
  const map = Object.fromEntries(sessions.map((s) => [s.participantId, s]));
  return NextResponse.json(map);
}

import type { NextRequest } from "next/server";
import { getAuthSession } from "./db";

export async function getParticipantId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("participant_token")?.value;
  if (!token) return null;
  const session = await getAuthSession(token);
  if (!session || session.role !== "participant") return null;
  return session.identity;
}

export async function getResearcherUser(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("researcher_token")?.value;
  if (!token) return null;
  const session = await getAuthSession(token);
  if (!session || session.role !== "researcher") return null;
  return session.identity;
}

export async function getAuthContext(request: NextRequest): Promise<{
  participantId: string | null;
  isResearcher: boolean;
}> {
  const researcher = await getResearcherUser(request);
  if (researcher) return { participantId: null, isResearcher: true };
  const participantId = await getParticipantId(request);
  return { participantId, isResearcher: false };
}

import type { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export async function getParticipantId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("participant_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "participant") return null;
  return payload.participantId;
}

export async function getResearcherUser(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("researcher_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "researcher") return null;
  return payload.username;
}

// 참가자 또는 연구자 모두 허용하는 라우트용
export async function getAuthContext(request: NextRequest): Promise<{
  participantId: string | null;
  isResearcher: boolean;
}> {
  const researcherToken = request.cookies.get("researcher_token")?.value;
  if (researcherToken) {
    const p = await verifyToken(researcherToken);
    if (p?.role === "researcher") return { participantId: null, isResearcher: true };
  }
  const participantToken = request.cookies.get("participant_token")?.value;
  if (participantToken) {
    const p = await verifyToken(participantToken);
    if (p?.role === "participant") return { participantId: p.participantId, isResearcher: false };
  }
  return { participantId: null, isResearcher: false };
}

import { createClient } from "@supabase/supabase-js";
import type { FilteringResponse, Session, SurveyResponse } from "./schemas";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key);
}

// ── 세션 ──────────────────────────────────────────────────────
function rowToSession(row: Record<string, unknown>): Session {
  return {
    participantId: row.participant_id as string,
    groupNum: row.group_num as 1 | 2,
    paperSet: row.paper_set as "vision" | "timeseries",
    currentStep: row.current_step as Session["currentStep"],
    createdAt: row.created_at as string
  };
}

export async function getSession(participantId: string): Promise<Session | null> {
  const { data } = await getClient()
    .from("sessions")
    .select("*")
    .eq("participant_id", participantId)
    .maybeSingle();
  return data ? rowToSession(data) : null;
}

export async function createSession(session: Session): Promise<void> {
  await getClient().from("sessions").insert({
    participant_id: session.participantId,
    group_num: session.groupNum,
    paper_set: session.paperSet,
    current_step: session.currentStep
  });
}

export async function updateSessionStep(
  participantId: string,
  step: Session["currentStep"]
): Promise<void> {
  await getClient()
    .from("sessions")
    .update({ current_step: step })
    .eq("participant_id", participantId);
}

export async function getAllSessions(): Promise<Session[]> {
  const { data } = await getClient().from("sessions").select("*").order("participant_id");
  return (data ?? []).map(rowToSession);
}

// ── 필터링 응답 ───────────────────────────────────────────────
function rowToResponse(row: Record<string, unknown>): FilteringResponse {
  return {
    id: row.id as string,
    participantId: row.participant_id as string,
    phase: row.phase as FilteringResponse["phase"],
    sentenceId: row.sentence_id as string,
    errorType: row.error_type as FilteringResponse["errorType"],
    isNoise: row.is_noise as boolean,
    userResponse: row.user_response as FilteringResponse["userResponse"],
    userRevision: (row.user_revision as string | null) ?? undefined,
    isCorrect: row.is_correct as boolean,
    score: row.score as number,
    confidence: row.confidence as number,
    responseTimeMs: (row.response_time_ms as number | null) ?? undefined,
    timestamp: row.created_at as string
  };
}

export async function saveFilteringResponse(response: FilteringResponse): Promise<void> {
  await getClient().from("filtering_responses").insert({
    participant_id: response.participantId,
    phase: response.phase,
    sentence_id: response.sentenceId,
    error_type: response.errorType,
    is_noise: response.isNoise,
    user_response: response.userResponse,
    user_revision: response.userRevision ?? null,
    is_correct: response.isCorrect,
    score: response.score,
    confidence: response.confidence,
    response_time_ms: response.responseTimeMs ?? null
  });
}

export async function getFilteringResponses(participantId?: string): Promise<FilteringResponse[]> {
  let query = getClient().from("filtering_responses").select("*").order("created_at");
  if (participantId) query = query.eq("participant_id", participantId);
  const { data } = await query;
  return (data ?? []).map(rowToResponse);
}

// ── 설문 응답 ─────────────────────────────────────────────────
export async function saveSurveyResponse(response: SurveyResponse): Promise<void> {
  await getClient().from("survey_responses").insert({
    participant_id: response.participantId,
    question_id: response.questionId,
    likert_score: response.likertScore
  });
}

export async function getSurveyResponses(participantId?: string): Promise<SurveyResponse[]> {
  let query = getClient().from("survey_responses").select("*").order("created_at");
  if (participantId) query = query.eq("participant_id", participantId);
  const { data } = await query;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    participantId: row.participant_id as string,
    questionId: row.question_id as string,
    likertScore: row.likert_score as number,
    timestamp: row.created_at as string
  }));
}

// ── 인증 세션 ─────────────────────────────────────────────────
export type AuthSessionRow = {
  token: string;
  role: "participant" | "researcher";
  identity: string;
  expiresAt: string;
};

export async function createAuthSession(
  token: string,
  role: "participant" | "researcher",
  identity: string,
  expiresInHours: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresInHours * 3_600_000).toISOString();
  await getClient().from("auth_sessions").insert({ token, role, identity, expires_at: expiresAt });
}

export async function getAuthSession(token: string): Promise<AuthSessionRow | null> {
  const now = new Date().toISOString();
  const { data } = await getClient()
    .from("auth_sessions")
    .select("*")
    .eq("token", token)
    .gt("expires_at", now)
    .maybeSingle();
  if (!data) return null;
  return {
    token: data.token as string,
    role: data.role as "participant" | "researcher",
    identity: data.identity as string,
    expiresAt: data.expires_at as string
  };
}

export async function deleteAuthSession(token: string): Promise<void> {
  await getClient().from("auth_sessions").delete().eq("token", token);
}

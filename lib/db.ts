import { createClient } from "@supabase/supabase-js";
import type { FilteringResponse, Session, SurveyResponse } from "./schemas";

export type ConceptMapRow = {
  participantId: string;
  paperSet: string;
  nodeCount: number;
  edgeCount: number;
  editCount: number;
  durationSec: number;
  graphData: unknown;
  createdAt: string;
};

export type QuizResponseRow = {
  id: string;
  participantId: string;
  paperSet: string;
  questionId: string;
  questionType: string;
  answer: string;
  isCorrect: boolean | null;
  autoScore: number | null;
  manualScore: number | null;
  createdAt: string;
};

export type MetacognitionRow = {
  id: string;
  participantId: string;
  paperSet: string;
  memoryPercent: number;
  expectedScore: number;
  createdAt: string;
};

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
    paperSet: row.paper_set as Session["paperSet"],
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

export async function countSessions(): Promise<number> {
  const { count } = await getClient().from("sessions").select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getAllSessions(): Promise<Session[]> {
  const { data } = await getClient().from("sessions").select("*").order("created_at");
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

// ── 독해 완료 시각 ────────────────────────────────────────────
export async function setReadingCompletedAt(participantId: string): Promise<void> {
  await getClient()
    .from("sessions")
    .update({ reading_completed_at: new Date().toISOString() })
    .eq("participant_id", participantId);
}

// ── 개념도 ────────────────────────────────────────────────────
export async function saveConceptMap(data: {
  participantId: string;
  paperSet: string;
  nodeCount: number;
  edgeCount: number;
  editCount: number;
  durationSec: number;
  graphData: unknown;
}): Promise<void> {
  await getClient().from("concept_maps").upsert({
    participant_id: data.participantId,
    paper_set: data.paperSet,
    node_count: data.nodeCount,
    edge_count: data.edgeCount,
    edit_count: data.editCount,
    duration_sec: data.durationSec,
    graph_data: data.graphData
  }, { onConflict: "participant_id" });
}

export async function getConceptMaps(): Promise<ConceptMapRow[]> {
  const { data } = await getClient().from("concept_maps").select("*").order("created_at");
  return (data ?? []).map((r) => ({
    participantId: r.participant_id as string,
    paperSet: r.paper_set as string,
    nodeCount: r.node_count as number,
    edgeCount: r.edge_count as number,
    editCount: r.edit_count as number,
    durationSec: r.duration_sec as number,
    graphData: r.graph_data,
    createdAt: r.created_at as string
  }));
}

// ── 메타인지 ──────────────────────────────────────────────────
export async function saveMetacognition(data: {
  participantId: string;
  paperSet: string;
  memoryPercent: number;
  expectedScore: number;
}): Promise<void> {
  await getClient().from("metacognition").insert({
    participant_id: data.participantId,
    paper_set: data.paperSet,
    memory_percent: data.memoryPercent,
    expected_score: data.expectedScore
  });
}

export async function getMetacognition(participantId?: string): Promise<MetacognitionRow[]> {
  let q = getClient().from("metacognition").select("*").order("created_at");
  if (participantId) q = q.eq("participant_id", participantId);
  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    participantId: r.participant_id as string,
    paperSet: r.paper_set as string,
    memoryPercent: r.memory_percent as number,
    expectedScore: r.expected_score as number,
    createdAt: r.created_at as string
  }));
}

// ── 퀴즈 응답 ────────────────────────────────────────────────
export async function saveQuizResponses(rows: {
  participantId: string;
  paperSet: string;
  questionId: string;
  questionType: string;
  answer: string;
  isCorrect: boolean | null;
  autoScore: number | null;
}[]): Promise<void> {
  await getClient().from("quiz_responses").insert(
    rows.map((r) => ({
      participant_id: r.participantId,
      paper_set: r.paperSet,
      question_id: r.questionId,
      question_type: r.questionType,
      answer: r.answer,
      is_correct: r.isCorrect,
      auto_score: r.autoScore
    }))
  );
}

export async function getQuizResponses(participantId?: string): Promise<QuizResponseRow[]> {
  let q = getClient().from("quiz_responses").select("*").order("created_at");
  if (participantId) q = q.eq("participant_id", participantId);
  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    participantId: r.participant_id as string,
    paperSet: r.paper_set as string,
    questionId: r.question_id as string,
    questionType: r.question_type as string,
    answer: r.answer as string,
    isCorrect: r.is_correct as boolean | null,
    autoScore: r.auto_score as number | null,
    manualScore: r.manual_score as number | null,
    createdAt: r.created_at as string
  }));
}

export async function updateQuizManualScore(id: string, manualScore: number): Promise<void> {
  await getClient().from("quiz_responses").update({ manual_score: manualScore }).eq("id", id);
}

// ── 관리자 초기화 ─────────────────────────────────────────────
export async function resetParticipantStep(
  participantId: string,
  step: Session["currentStep"] = "reading"
): Promise<void> {
  await getClient().from("sessions").update({ current_step: step }).eq("participant_id", participantId);
  // 해당 참가자의 인증 세션 삭제 (재로그인 유도)
  await getClient()
    .from("auth_sessions")
    .delete()
    .eq("role", "participant")
    .eq("identity", participantId);
}

export async function deleteParticipantResponses(participantId: string): Promise<void> {
  await getClient().from("filtering_responses").delete().eq("participant_id", participantId);
  await getClient().from("survey_responses").delete().eq("participant_id", participantId);
  await getClient().from("quiz_responses").delete().eq("participant_id", participantId);
  await getClient().from("metacognition").delete().eq("participant_id", participantId);
  await getClient().from("concept_maps").delete().eq("participant_id", participantId);
}

export async function resetAllData(): Promise<void> {
  await getClient().from("auth_sessions").delete().neq("token", "___none___");
  await getClient().from("filtering_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await getClient().from("survey_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await getClient().from("quiz_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await getClient().from("metacognition").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await getClient().from("concept_maps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await getClient().from("sessions").delete().neq("participant_id", "___none___");
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

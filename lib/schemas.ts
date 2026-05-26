import { z } from "zod";

// ── 참가자 세션 ──────────────────────────────────────────────
export const sessionSchema = z.object({
  participantId: z.string(),           // "01" ~ "30"
  groupNum: z.union([z.literal(1), z.literal(2)]),  // 1=홀수(구조도↑), 2=짝수(요약문↑)
  paperSet: z.union([z.literal("vision"), z.literal("timeseries"), z.literal("optical"), z.literal("lp")]),
  currentStep: z.enum(["guide", "reading", "pre-test", "filtering", "post-test", "survey", "done"]),
  createdAt: z.string()
});

export type Session = z.infer<typeof sessionSchema>;

// ── 문장 ─────────────────────────────────────────────────────
export const errorTypeSchema = z.enum(["none", "direction", "causality", "scope", "limitation"]);
export type ErrorType = z.infer<typeof errorTypeSchema>;

export const sentenceSchema = z.object({
  id: z.string(),
  statement: z.string(),
  isNoise: z.boolean(),
  errorType: errorTypeSchema,
  evidenceQuote: z.string(),
  evidencePage: z.number().int().positive(),
  correctedStatement: z.string().optional(),
  explanation: z.string().optional()
});

export type Sentence = z.infer<typeof sentenceSchema>;

export const phaseSchema = z.enum(["pre", "filtering", "post"]);
export type Phase = z.infer<typeof phaseSchema>;

export const sentenceSetSchema = z.object({
  phase: phaseSchema,
  paperSet: z.union([z.literal("vision"), z.literal("timeseries"), z.literal("optical"), z.literal("lp")]),
  paper: z.string(),
  sentences: z.array(sentenceSchema)
});

export type SentenceSet = z.infer<typeof sentenceSetSchema>;

// ── 필터링 응답 ───────────────────────────────────────────────
export const userResponseSchema = z.enum(["accept", "reject", "revise", "insufficient"]);
export type UserResponse = z.infer<typeof userResponseSchema>;

export const filteringResponseSchema = z.object({
  id: z.string(),
  participantId: z.string(),
  phase: phaseSchema,
  sentenceId: z.string(),
  errorType: errorTypeSchema,
  isNoise: z.boolean(),
  userResponse: userResponseSchema,
  userRevision: z.string().optional(),
  isCorrect: z.boolean(),
  score: z.number().int().nonnegative(),
  confidence: z.number().int().min(1).max(5),
  responseTimeMs: z.number().int().nonnegative().optional(),
  timestamp: z.string()
});

export type FilteringResponse = z.infer<typeof filteringResponseSchema>;

// ── 설문 응답 ─────────────────────────────────────────────────
export const surveyResponseSchema = z.object({
  id: z.string(),
  participantId: z.string(),
  questionId: z.string(),
  likertScore: z.number().int().min(1).max(5),
  timestamp: z.string()
});

export type SurveyResponse = z.infer<typeof surveyResponseSchema>;

// ── 전체 데이터 저장소 ────────────────────────────────────────
export const dataStoreSchema = z.object({
  sessions: z.record(z.string(), sessionSchema),
  filteringResponses: z.array(filteringResponseSchema),
  surveyResponses: z.array(surveyResponseSchema)
});

export type DataStore = z.infer<typeof dataStoreSchema>;

// ── 점수 결과 요약 ────────────────────────────────────────────
export const phaseResultSchema = z.object({
  phase: phaseSchema,
  totalScore: z.number().int(),
  maxScore: z.number().int(),
  errorDetected: z.number().int(),
  correctAccepted: z.number().int(),
  errorAccepted: z.number().int(),
  weakErrorType: errorTypeSchema.optional()
});

export type PhaseResult = z.infer<typeof phaseResultSchema>;

// ── 설문 문항 정의 ────────────────────────────────────────────
export const filteringSurveyQuestions = [
  { id: "fq1", text: "이 기능이 AI 요약문을 더 신중하게 보게 만들었다.", purpose: "자동화 편향 완화 체감" },
  { id: "fq2", text: "오류 찾기 과정이 논문 이해에 도움이 되었다.", purpose: "기능 유용성" },
  { id: "fq3", text: "검토 점수가 집중하는 데 도움이 되었다.", purpose: "점수 시스템 효과" },
  { id: "fq4", text: "AI 요약문 검토 기능 사용이 번거로웠다.", purpose: "사용 부담" },
  { id: "fq5", text: "앞으로 논문을 읽을 때 AI 요약문 검토 기능을 사용할 의향이 있다.", purpose: "실제 적용 가능성" }
] as const;

export const conceptMapSurveyQuestions = [
  { id: "cq1", text: "개념도를 직접 구성하는 과정이 논문 이해에 도움이 됐다.", purpose: "기능 유용성 체감" },
  { id: "cq2", text: "키워드를 연결하면서 개념 간 관계가 명확해졌다.", purpose: "내재화 체감" },
  { id: "cq3", text: "요약문만 읽는 것보다 더 깊이 생각하게 만들었다.", purpose: "능동적 조작 효과 체감" },
  { id: "cq4", text: "개념도 구성 과정이 번거로웠다.", purpose: "사용 부담감" },
  { id: "cq5", text: "앞으로 논문을 읽을 때 이 방식을 계속 사용할 의향이 있다.", purpose: "실제 적용 가능성" }
] as const;

// 하위 호환
export const surveyQuestions = filteringSurveyQuestions;

export type SurveyQuestionId =
  | (typeof filteringSurveyQuestions)[number]["id"]
  | (typeof conceptMapSurveyQuestions)[number]["id"];

import type { UserInteractionState } from "./schemas";

export type EngagementLevel = "고각성" | "적정" | "저각성" | "개입 필요";

export function calculateEngagementScore(
  state: Omit<UserInteractionState, "engagementScore">
): number {
  const interactionScore = Math.min(1, state.actionsInLast5Minutes / 12);
  const detectionScore = state.correctGatewayAnswers / Math.max(1, state.gatewayAttempts);
  const structureScore = Math.min(1, 0.5 * (state.placedNodes / 8) + 0.5 * (state.createdEdges / 6));
  const evidenceScore = state.checkedEvidenceCount / Math.max(1, state.summarySentenceCount);

  return Math.round(
    100 *
      (0.25 * interactionScore +
        0.3 * detectionScore +
        0.25 * structureScore +
        0.2 * evidenceScore)
  );
}

export function getEngagementLevel(score: number): EngagementLevel {
  if (score >= 80) return "고각성";
  if (score >= 50) return "적정";
  if (score >= 30) return "저각성";
  return "개입 필요";
}

export function shouldShowCoachingQuestion(score: number): boolean {
  return score < 45;
}

export const coachingQuestions = [
  "이 문단의 핵심 주장은 어떤 근거에서 도출되었나요?",
  "현재 연결한 두 지식 파편의 관계는 인과인가요, 단순 연관인가요?",
  "AI 요약 문장 중 가장 검증이 필요한 문장은 무엇인가요?"
] as const;

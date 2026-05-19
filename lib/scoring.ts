import type { ErrorType, FilteringResponse, Phase, PhaseResult, Sentence, UserResponse } from "./schemas";

/** 응답 하나에 대한 정답 여부와 점수를 계산한다. */
export function scoreResponse(
  sentence: Sentence,
  userResponse: UserResponse,
  userRevision?: string
): { isCorrect: boolean; score: number } {
  if (sentence.isNoise) {
    if (userResponse === "reject") return { isCorrect: true, score: 2 };
    if (userResponse === "revise" && userRevision && userRevision.trim().length > 0) {
      return { isCorrect: true, score: 3 };
    }
    return { isCorrect: false, score: 0 };
  } else {
    if (userResponse === "accept") return { isCorrect: true, score: 1 };
    return { isCorrect: false, score: 0 };
  }
}

/** 한 phase의 응답 목록을 집계하여 PhaseResult를 반환한다. */
export function aggregatePhaseResult(
  phase: Phase,
  responses: FilteringResponse[]
): PhaseResult {
  const phaseResponses = responses.filter((r) => r.phase === phase);
  const totalScore = phaseResponses.reduce((sum, r) => sum + r.score, 0);

  // 최대 점수: 정상 문장은 1점, 오류 문장은 3점(수정)이 이론적 최대이나
  // 기준은 기각(+2) 기준으로 계산한다.
  const maxScore = phaseResponses.reduce((sum, r) => sum + (r.isNoise ? 2 : 1), 0);
  const errorDetected = phaseResponses.filter((r) => r.isNoise && r.isCorrect).length;
  const correctAccepted = phaseResponses.filter((r) => !r.isNoise && r.isCorrect).length;
  const errorAccepted = phaseResponses.filter((r) => r.isNoise && !r.isCorrect).length;

  // 가장 많이 틀린 오류 유형 (취약 유형)
  const errorTypeCounts: Partial<Record<ErrorType, number>> = {};
  for (const r of phaseResponses) {
    if (r.isNoise && !r.isCorrect) {
      errorTypeCounts[r.errorType] = (errorTypeCounts[r.errorType] ?? 0) + 1;
    }
  }
  const weakErrorType = (
    Object.entries(errorTypeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as ErrorType | undefined
  );

  return { phase, totalScore, maxScore, errorDetected, correctAccepted, errorAccepted, weakErrorType };
}

/** 두 phase 점수를 비교해 개선률을 반환한다 (사전 대비 사후). */
export function calcImprovementRate(pre: PhaseResult, post: PhaseResult): number {
  if (pre.maxScore === 0) return 0;
  const preRate = pre.totalScore / pre.maxScore;
  const postRate = post.maxScore === 0 ? 0 : post.totalScore / post.maxScore;
  return Math.round((postRate - preRate) * 100);
}

/** 오류 유형 한국어 레이블 */
export const errorTypeLabel: Record<ErrorType, string> = {
  none: "없음",
  direction: "방향성 오류",
  causality: "인과관계 오류",
  scope: "범위 과장",
  limitation: "한계점 삭제"
};

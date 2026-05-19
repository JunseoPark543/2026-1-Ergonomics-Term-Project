import { describe, expect, it } from "vitest";
import { scoreResponse, aggregatePhaseResult, calcImprovementRate } from "../lib/scoring";
import type { FilteringResponse, Sentence } from "../lib/schemas";

const correctSentence: Sentence = {
  id: "s1", statement: "test", isNoise: false, errorType: "none",
  evidenceQuote: "quote", evidencePage: 1
};
const noiseSentence: Sentence = {
  id: "s2", statement: "test noise", isNoise: true, errorType: "direction",
  evidenceQuote: "quote", evidencePage: 1,
  correctedStatement: "corrected", explanation: "exp"
};

describe("scoreResponse", () => {
  it("정상 문장을 수용하면 +1", () => {
    expect(scoreResponse(correctSentence, "accept")).toEqual({ isCorrect: true, score: 1 });
  });

  it("정상 문장을 기각하면 0", () => {
    expect(scoreResponse(correctSentence, "reject")).toEqual({ isCorrect: false, score: 0 });
  });

  it("오류 문장을 기각하면 +2", () => {
    expect(scoreResponse(noiseSentence, "reject")).toEqual({ isCorrect: true, score: 2 });
  });

  it("오류 문장을 수정하면 +3", () => {
    expect(scoreResponse(noiseSentence, "revise", "올바른 내용")).toEqual({ isCorrect: true, score: 3 });
  });

  it("수정 내용이 비어 있으면 수정으로 인정하지 않음", () => {
    expect(scoreResponse(noiseSentence, "revise", "")).toEqual({ isCorrect: false, score: 0 });
  });

  it("오류 문장을 수용하면 0", () => {
    expect(scoreResponse(noiseSentence, "accept")).toEqual({ isCorrect: false, score: 0 });
  });

  it("근거 부족 선택 시 정상 문장은 0점", () => {
    expect(scoreResponse(correctSentence, "insufficient")).toEqual({ isCorrect: false, score: 0 });
  });
});

describe("aggregatePhaseResult", () => {
  const makeResponse = (
    phase: FilteringResponse["phase"],
    isNoise: boolean,
    isCorrect: boolean,
    score: number,
    errorType: FilteringResponse["errorType"] = "none"
  ): FilteringResponse => ({
    id: crypto.randomUUID(),
    participantId: "01",
    phase,
    sentenceId: "s",
    errorType,
    isNoise,
    userResponse: "accept",
    isCorrect,
    score,
    confidence: 3,
    timestamp: new Date().toISOString()
  });

  it("phase 별로 점수를 집계한다", () => {
    const responses: FilteringResponse[] = [
      makeResponse("pre", false, true, 1),
      makeResponse("pre", true, true, 2, "direction"),
      makeResponse("pre", true, false, 0, "causality"),
      makeResponse("filtering", false, true, 1)
    ];
    const result = aggregatePhaseResult("pre", responses);
    expect(result.totalScore).toBe(3);
    expect(result.maxScore).toBe(5);  // 1 + 2 + 2
    expect(result.errorDetected).toBe(1);
    expect(result.errorAccepted).toBe(1);
    expect(result.weakErrorType).toBe("causality");
  });

  it("응답이 없는 phase는 0점을 반환한다", () => {
    const result = aggregatePhaseResult("post", []);
    expect(result.totalScore).toBe(0);
    expect(result.maxScore).toBe(0);
  });
});

describe("calcImprovementRate", () => {
  it("사후 점수가 사전보다 높으면 양수를 반환한다", () => {
    const pre = aggregatePhaseResult("pre", []);
    const post = aggregatePhaseResult("post", []);
    // 직접 수치 주입
    const preResult = { ...pre, totalScore: 3, maxScore: 8 };
    const postResult = { ...post, totalScore: 6, maxScore: 8 };
    expect(calcImprovementRate(preResult, postResult)).toBe(38);  // (6/8 - 3/8) * 100 = 37.5 → 38
  });

  it("maxScore가 0이면 0을 반환한다", () => {
    const pre = { phase: "pre" as const, totalScore: 0, maxScore: 0, errorDetected: 0, correctAccepted: 0, errorAccepted: 0 };
    const post = { phase: "post" as const, totalScore: 0, maxScore: 0, errorDetected: 0, correctAccepted: 0, errorAccepted: 0 };
    expect(calcImprovementRate(pre, post)).toBe(0);
  });
});

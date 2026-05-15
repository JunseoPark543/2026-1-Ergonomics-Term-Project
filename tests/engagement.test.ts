import { describe, expect, it } from "vitest";
import { calculateEngagementScore, getEngagementLevel, shouldShowCoachingQuestion } from "../lib/engagement";

describe("engagement scoring", () => {
  it("calculates the weighted engagement score from interaction, detection, structure, and evidence signals", () => {
    const score = calculateEngagementScore({
      actionsInLast5Minutes: 12,
      gatewayAttempts: 2,
      correctGatewayAnswers: 1,
      placedNodes: 8,
      createdEdges: 6,
      checkedEvidenceCount: 2,
      summarySentenceCount: 4
    });

    expect(score).toBe(75);
  });

  it("caps interaction and structure scores at 1", () => {
    const score = calculateEngagementScore({
      actionsInLast5Minutes: 30,
      gatewayAttempts: 1,
      correctGatewayAnswers: 1,
      placedNodes: 30,
      createdEdges: 30,
      checkedEvidenceCount: 4,
      summarySentenceCount: 4
    });

    expect(score).toBe(100);
  });

  it("maps score bands to Korean dashboard levels", () => {
    expect(getEngagementLevel(81)).toBe("고각성");
    expect(getEngagementLevel(50)).toBe("적정");
    expect(getEngagementLevel(30)).toBe("저각성");
    expect(getEngagementLevel(29)).toBe("개입 필요");
  });

  it("shows a coaching prompt below 45", () => {
    expect(shouldShowCoachingQuestion(44)).toBe(true);
    expect(shouldShowCoachingQuestion(45)).toBe(false);
  });
});

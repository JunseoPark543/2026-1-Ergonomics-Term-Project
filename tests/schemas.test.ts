import { describe, expect, it } from "vitest";
import { sectionAnalysisSchema } from "../lib/schemas";
import { sampleAnalysis } from "../lib/sample-analysis";

describe("section analysis schema", () => {
  it("accepts the bundled prototype analysis data", () => {
    const parsed = sectionAnalysisSchema.parse(sampleAnalysis.sections[0]);

    expect(parsed.gatewayItems).toHaveLength(4);
    expect(parsed.gatewayItems.filter((item) => item.isNoise)).toHaveLength(1);
    expect(parsed.summary.every((sentence) => sentence.evidenceIds.length > 0)).toBe(true);
  });

  it("rejects summaries without source evidence", () => {
    const invalid = {
      ...sampleAnalysis.sections[0],
      summary: [{ ...sampleAnalysis.sections[0].summary[0], evidenceIds: [] }]
    };

    expect(() => sectionAnalysisSchema.parse(invalid)).toThrow();
  });
});

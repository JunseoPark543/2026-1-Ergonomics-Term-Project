import OpenAI from "openai";
import { analysisResponseSchema, type AnalysisResponse } from "./schemas";
import { sampleAnalysis } from "./sample-analysis";

const SYSTEM_PROMPT = `너는 학술 논문 독해 헬퍼의 분석 엔진이다. 완성 요약을 먼저 주지 말고, 원문 근거 기반 지식 파편, 검증 게이트웨이, 조건부 요약을 JSON으로만 생성한다. 모든 AI 생성 문장은 evidence id를 가져야 한다. 근거가 부족하면 confidence를 낮춘다.`;

export async function analyzePaperText(text: string): Promise<AnalysisResponse> {
  if (!process.env.OPENAI_API_KEY || text.trim().length < 200) {
    return sampleAnalysis;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          "다음 논문 텍스트 일부를 섹션 단위로 분석하라. 3개 사실 문장과 1개 의도적 오류 문장을 포함하라.\n\n" +
          text.slice(0, 18000)
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "paper_analysis",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["sections"],
          properties: {
            sections: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                additionalProperties: false,
                required: [
                  "sectionId",
                  "title",
                  "pageStart",
                  "pageEnd",
                  "evidences",
                  "fragments",
                  "gatewayItems",
                  "summary"
                ],
                properties: {
                  sectionId: { type: "string" },
                  title: { type: "string" },
                  pageStart: { type: "number" },
                  pageEnd: { type: "number" },
                  evidences: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["id", "page", "quote"],
                      properties: {
                        id: { type: "string" },
                        page: { type: "number" },
                        quote: { type: "string" },
                        sectionTitle: { type: "string" },
                        bbox: {
                          type: "object",
                          additionalProperties: false,
                          required: ["x", "y", "width", "height"],
                          properties: {
                            x: { type: "number" },
                            y: { type: "number" },
                            width: { type: "number" },
                            height: { type: "number" }
                          }
                        }
                      }
                    }
                  },
                  fragments: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["id", "label", "description", "type", "evidenceIds", "confidence", "difficulty"],
                      properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        description: { type: "string" },
                        type: {
                          type: "string",
                          enum: ["concept", "claim", "method", "result", "limitation", "implication"]
                        },
                        evidenceIds: { type: "array", items: { type: "string" } },
                        confidence: { type: "number" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                      }
                    }
                  },
                  gatewayItems: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["id", "statement", "isNoise", "evidenceIds"],
                      properties: {
                        id: { type: "string" },
                        statement: { type: "string" },
                        isNoise: { type: "boolean" },
                        distortionType: {
                          type: "string",
                          enum: ["scope", "causality", "comparison", "definition", "exaggeration"]
                        },
                        evidenceIds: { type: "array", items: { type: "string" } },
                        correctedStatement: { type: "string" },
                        explanation: { type: "string" }
                      }
                    }
                  },
                  summary: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["id", "sentence", "evidenceIds", "confidence"],
                      properties: {
                        id: { type: "string" },
                        sentence: { type: "string" },
                        evidenceIds: { type: "array", items: { type: "string" } },
                        confidence: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        strict: true
      }
    }
  });

  const parsed = JSON.parse(response.output_text);
  return analysisResponseSchema.parse(parsed);
}

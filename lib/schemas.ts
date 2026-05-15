import { z } from "zod";

export const evidenceSchema = z.object({
  id: z.string(),
  page: z.number().int().positive(),
  quote: z.string().min(1),
  sectionTitle: z.string().optional(),
  bbox: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    })
    .optional()
});

export const knowledgeFragmentSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["concept", "claim", "method", "result", "limitation", "implication"]),
  evidenceIds: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
  difficulty: z.enum(["easy", "medium", "hard"])
});

export const gatewayItemSchema = z.object({
  id: z.string(),
  statement: z.string().min(1),
  isNoise: z.boolean(),
  distortionType: z.enum(["scope", "causality", "comparison", "definition", "exaggeration"]).optional(),
  evidenceIds: z.array(z.string()).min(1),
  correctedStatement: z.string().optional(),
  explanation: z.string().optional()
});

export const summarySentenceSchema = z.object({
  id: z.string(),
  sentence: z.string().min(1),
  evidenceIds: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
  userVerification: z.enum(["matched", "uncertain", "mismatched"]).optional()
});

export const sectionAnalysisSchema = z.object({
  sectionId: z.string(),
  title: z.string(),
  pageStart: z.number().int().positive(),
  pageEnd: z.number().int().positive(),
  evidences: z.array(evidenceSchema),
  fragments: z.array(knowledgeFragmentSchema),
  gatewayItems: z.array(gatewayItemSchema).length(4),
  summary: z.array(summarySentenceSchema)
});

export const userInteractionStateSchema = z.object({
  actionsInLast5Minutes: z.number().int().nonnegative(),
  gatewayAttempts: z.number().int().nonnegative(),
  correctGatewayAnswers: z.number().int().nonnegative(),
  placedNodes: z.number().int().nonnegative(),
  createdEdges: z.number().int().nonnegative(),
  checkedEvidenceCount: z.number().int().nonnegative(),
  summarySentenceCount: z.number().int().nonnegative(),
  engagementScore: z.number().int().min(0).max(100)
});

export type Evidence = z.infer<typeof evidenceSchema>;
export type KnowledgeFragment = z.infer<typeof knowledgeFragmentSchema>;
export type GatewayItem = z.infer<typeof gatewayItemSchema>;
export type SummarySentence = z.infer<typeof summarySentenceSchema>;
export type SectionAnalysis = z.infer<typeof sectionAnalysisSchema>;
export type UserInteractionState = z.infer<typeof userInteractionStateSchema>;

export const analysisResponseSchema = z.object({
  sections: z.array(sectionAnalysisSchema).min(1)
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

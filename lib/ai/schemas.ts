import { z } from "zod/v4";
import { CanvasNodeSchema, CanvasEdgeSchema } from "@/lib/blocks/schemas";

export const GenerateCanvasResponseSchema = z.object({
  stack: z.object({
    frontend: z.string(),
    backend: z.string(),
    db: z.string(),
    hosting: z.string(),
    integrations: z.array(z.string()),
  }),
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
  reasoning: z.string(),
});

export const CanvasSuggestionSchema = z.object({
  summary: z.string(),
  suggestedAdditions: z.array(CanvasNodeSchema),
  suggestedConnections: z.array(CanvasEdgeSchema),
  warnings: z.array(z.string()),
});

export type GenerateCanvasResponse = z.infer<typeof GenerateCanvasResponseSchema>;
export type CanvasSuggestion = z.infer<typeof CanvasSuggestionSchema>;

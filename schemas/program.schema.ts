import { z } from "zod";
import { confidenceSchema, idSchema, sourceReferenceSchema, statusSchema } from "./shared";

export const programSchema = z
  .object({
    id: idSchema,
    name: z.string().trim().min(1),
    abbreviation: z.string().trim().min(1).nullable().optional(),
    owning_org_ids: z.array(idSchema).default([]),
    related_org_ids: z.array(idSchema).default([]),
    related_budget_line_ids: z.array(idSchema).default([]),
    capability_tags: z.array(z.string().trim().min(1)).default([]),
    description_short: z.string().trim().nullable().optional(),
    status: statusSchema,
    confidence: confidenceSchema,
    sources: z.array(sourceReferenceSchema).min(1)
  })
  .strict();

export type ProgramRecord = z.infer<typeof programSchema>;

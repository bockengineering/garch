import { z } from "zod";
import { confidenceSchema, dateTimeSchema, idSchema } from "./shared";

export const fundingSchema = z
  .object({
    id: idSchema,
    source: z.string().trim().min(1),
    fiscal_year: z.number().int().min(1900),
    appropriation: z.string().trim().min(1).nullable().optional(),
    program_element: z.string().trim().min(1).nullable().optional(),
    budget_line_id: idSchema.nullable().optional(),
    awarding_agency: z.string().trim().min(1).nullable().optional(),
    awarding_subagency: z.string().trim().min(1).nullable().optional(),
    linked_org_ids: z.array(idSchema).default([]),
    recipient_name: z.string().trim().min(1).nullable().optional(),
    obligated_amount: z.number().nonnegative().nullable().optional(),
    award_type: z.string().trim().min(1).nullable().optional(),
    confidence: confidenceSchema,
    source_url: z.string().url().nullable().optional(),
    last_imported: dateTimeSchema
  })
  .strict();

export type FundingRecord = z.infer<typeof fundingSchema>;

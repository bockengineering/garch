import { z } from "zod";
import { confidenceSchema, idSchema } from "./shared";
import { serviceValues } from "./org.schema";

export const budgetLineSchema = z
  .object({
    id: idSchema,
    fiscal_year: z.number().int().min(1900),
    service: z.enum(serviceValues),
    appropriation: z.string().trim().min(1),
    program_element: z.string().trim().min(1).nullable().optional(),
    line_number: z.string().trim().min(1).nullable().optional(),
    title: z.string().trim().min(1),
    owning_org_ids: z.array(idSchema).default([]),
    related_program_ids: z.array(idSchema).default([]),
    amount: z.number().nonnegative().nullable().optional(),
    source_ids: z.array(idSchema).min(1),
    confidence: confidenceSchema,
    notes: z.string().trim().nullable().optional()
  })
  .strict();

export type BudgetLineRecord = z.infer<typeof budgetLineSchema>;

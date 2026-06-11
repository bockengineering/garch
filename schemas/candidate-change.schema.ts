import { z } from "zod";
import { confidenceSchema, dateTimeSchema, idSchema } from "./shared";

export const candidateChangeTypeValues = [
  "new_org",
  "update_org",
  "new_person",
  "update_person",
  "new_assignment",
  "close_assignment",
  "new_program",
  "update_program",
  "new_budget_line",
  "update_budget_line",
  "new_funding_record",
  "new_source",
  "possible_duplicate",
  "conflicting_source"
] as const;

export const reviewStatusValues = [
  "pending",
  "approved",
  "rejected",
  "needs_more_evidence"
] as const;

export const candidateChangeSchema = z
  .object({
    id: idSchema,
    change_type: z.enum(candidateChangeTypeValues),
    affected_entity_ids: z.array(idSchema).default([]),
    proposed_action: z.string().trim().min(1),
    proposed_record_patch: z.record(z.string(), z.unknown()).default({}),
    source_ids: z.array(idSchema).default([]),
    evidence_quotes: z.array(z.string().trim()).default([]),
    confidence: confidenceSchema,
    agent_name: z.string().trim().min(1),
    created_at: dateTimeSchema,
    review_status: z.enum(reviewStatusValues)
  })
  .strict();

export type CandidateChangeRecord = z.infer<typeof candidateChangeSchema>;
export type CandidateChangeType = (typeof candidateChangeTypeValues)[number];
export type ReviewStatus = (typeof reviewStatusValues)[number];

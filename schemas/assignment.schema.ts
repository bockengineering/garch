import { z } from "zod";
import {
  confidenceSchema,
  dateSchema,
  idSchema,
  optionalDateSchema,
  sourceReferenceSchema
} from "./shared";

export const assignmentStatusValues = [
  "current_claimed",
  "verified_current",
  "former",
  "stale",
  "conflicting",
  "needs_review"
] as const;

export const roleTypeValues = [
  "secretary",
  "deputy",
  "under_secretary",
  "assistant_secretary",
  "acquisition_executive",
  "portfolio_acquisition_executive",
  "capability_program_executive",
  "program_manager",
  "deputy_program_manager",
  "chief_engineer",
  "contracting",
  "financial_management",
  "test_and_evaluation",
  "requirements",
  "chief_of_staff",
  "technical_director",
  "other"
] as const;

export const assignmentSchema = z
  .object({
    id: idSchema,
    person_id: idSchema,
    org_id: idSchema,
    role_title: z.string().trim().min(1),
    role_type: z.enum(roleTypeValues),
    valid_from: optionalDateSchema,
    valid_to: optionalDateSchema,
    status: z.enum(assignmentStatusValues),
    confidence: confidenceSchema,
    sources: z.array(sourceReferenceSchema).min(1),
    last_verified: dateSchema
  })
  .strict();

export type AssignmentRecord = z.infer<typeof assignmentSchema>;
export type AssignmentStatus = (typeof assignmentStatusValues)[number];
export type RoleType = (typeof roleTypeValues)[number];

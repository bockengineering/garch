import { z } from "zod";
import {
  confidenceSchema,
  dateSchema,
  idSchema,
  sourceReferenceSchema,
  statusSchema
} from "./shared";

export const orgTypeValues = [
  "department",
  "office",
  "service",
  "command",
  "directorate",
  "acquisition_executive",
  "portfolio",
  "capability_program",
  "program_executive_office",
  "program_office",
  "lab",
  "test_center",
  "congressional_office",
  "external_agency",
  "other"
] as const;

export const serviceValues = [
  "dow",
  "osd",
  "army",
  "navy",
  "marine_corps",
  "air_force",
  "space_force",
  "coast_guard",
  "socom",
  "cocom",
  "doe",
  "commerce",
  "other"
] as const;

export const orgSchema = z
  .object({
    id: idSchema,
    type: z.enum(orgTypeValues),
    name: z.string().trim().min(1),
    abbreviation: z.string().trim().min(1).nullable().optional(),
    parent_id: idSchema.nullable().optional(),
    service: z.enum(serviceValues),
    functions: z.array(z.string().trim().min(1)).default([]),
    capability_tags: z.array(z.string().trim().min(1)).default([]),
    location_ids: z.array(idSchema).default([]),
    status: statusSchema,
    confidence: confidenceSchema,
    last_verified: dateSchema,
    sources: z.array(sourceReferenceSchema).min(1)
  })
  .strict();

export type OrgRecord = z.infer<typeof orgSchema>;
export type OrgType = (typeof orgTypeValues)[number];
export type Service = (typeof serviceValues)[number];

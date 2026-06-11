import { z } from "zod";
import { dateTimeSchema, idSchema } from "./shared";

export const sourceTypeValues = [
  "directory_seed",
  "official_webpage",
  "official_pdf",
  "budget_document",
  "usaspending",
  "fpds",
  "sam_gov",
  "press_release",
  "congressional_page",
  "manual_research"
] as const;

export const licenseStatusValues = [
  "public_government",
  "public_web",
  "seed_only_no_republication",
  "restricted",
  "unknown"
] as const;

export const sourceSchema = z
  .object({
    id: idSchema,
    type: z.enum(sourceTypeValues),
    title: z.string().trim().min(1),
    publisher: z.string().trim().min(1).nullable().optional(),
    url: z.string().url().nullable().optional(),
    retrieved_at: dateTimeSchema.nullable().optional(),
    content_hash: z.string().trim().min(1).nullable().optional(),
    license_status: z.enum(licenseStatusValues),
    notes: z.string().trim().nullable().optional()
  })
  .strict();

export type SourceRecord = z.infer<typeof sourceSchema>;
export type SourceType = (typeof sourceTypeValues)[number];
export type LicenseStatus = (typeof licenseStatusValues)[number];

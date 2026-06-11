import { z } from "zod";

export const confidenceValues = ["high", "medium", "low", "unknown"] as const;
export const statusValues = [
  "active",
  "inactive",
  "stale",
  "needs_review",
  "conflicting",
  "unknown"
] as const;

export const confidenceSchema = z.enum(confidenceValues);
export const statusSchema = z.enum(statusValues);

export const idSchema = z.string().trim().min(1);
export const optionalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const dateTimeSchema = z.string().datetime({ offset: true });

export const sourceReferenceSchema = z
  .object({
    source_id: idSchema,
    page: z.union([z.number().int().positive(), z.string().trim().min(1)]).optional(),
    usage: z.string().trim().min(1).optional()
  })
  .strict();

export type Confidence = (typeof confidenceValues)[number];
export type Status = (typeof statusValues)[number];

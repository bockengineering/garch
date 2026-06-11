import { z } from "zod";
import { confidenceSchema, idSchema, sourceReferenceSchema } from "./shared";

export const personSchema = z
  .object({
    id: idSchema,
    name: z.string().trim().min(1),
    aliases: z.array(z.string().trim().min(1)).default([]),
    public_profile_urls: z.array(z.string().url()).default([]),
    notes: z.string().trim().nullable().optional(),
    confidence: confidenceSchema,
    sources: z.array(sourceReferenceSchema).min(1)
  })
  .strict();

export type PersonRecord = z.infer<typeof personSchema>;

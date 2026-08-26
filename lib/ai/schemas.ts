import { z } from "zod";

export const extractedSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  minimumProficiency: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  required: z.boolean(),
});

export const extractedOpportunitySchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  location: z.string().nullable(),
  type: z.enum([
    "INTERNSHIP",
    "JOB",
    "PROJECT",
    "MENTORSHIP",
    "FDP",
    "RESEARCH",
    "CONSULTANCY",
    "INDUSTRIAL_TRAINING",
    "GUEST_LECTURE",
  ]),
  skills: z
    .array(extractedSkillSchema)
    .min(1),
});

export type ExtractedOpportunity = z.infer<
  typeof extractedOpportunitySchema
>;
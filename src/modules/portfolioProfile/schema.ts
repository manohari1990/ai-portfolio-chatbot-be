import { z } from "zod";

export const portfolioProfileSchema = z.object({
  total_exp_years: z
    .number()
    .min(0, "Experience cannot be negative"),

  bio: z
    .string()
    .min(1, "Bio is required"),

  github_url: z
    .url("Invalid GitHub URL")
    .optional(),

  linkedin_url: z
    .url("Invalid LinkedIn URL")
    .optional(),

  resume_file_id: z
    .string()
    .optional(),
});

export const portfolioIdSchema = z.object({
  portfolioId: z.uuid("Invalid portfolio ID"),
});
import { z } from "zod";

export const createPortfolioSchema = z.object({
  portfolio_name: z
    .string()
    .trim()
    .min(1, "Portfolio name is required")
    .max(150, "Portfolio name cannot exceed 150 characters"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can contain lowercase letters, numbers and hyphens only"
    ),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  is_active: z.boolean().optional(),
});

export const updatePortfolioSchema = z
  .object({
    portfolio_name: z
      .string()
      .trim()
      .min(1)
      .max(150)
      .optional(),

    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can contain lowercase letters, numbers and hyphens only"
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),

    is_active: z.boolean().optional(),
    user_id: z
      .string()
      .trim(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );

export const getPortfoliosQuerySchema = z.object({
  user_id: z.uuid("Invalid user ID"),
});

export const portfolioIdSchema = z.object({
  id: z.uuid("Invalid portfolio ID"),
});

export type CreatePortfolioInput = z.infer<
  typeof createPortfolioSchema
>;

export type UpdatePortfolioInput = z.infer<
  typeof updatePortfolioSchema
>;
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { requireOwnedPortfolio } from "../middleware/portfolio.js";

const router = Router();
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

router.use(requireAuth);

router.get("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, slug, status, created_at FROM portfolios WHERE owner_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const name = z.string().min(2).max(100).parse(req.body.name);
    const requestedSlug = req.body.slug
      ? z.string().min(3).max(80).parse(req.body.slug)
      : name;
    const { rows } = await db.query(
      "INSERT INTO portfolios (owner_id, name, slug) VALUES ($1, $2, $3) RETURNING id, name, slug, status",
      [req.userId, name, slugify(requestedSlug)]
    );
    await db.query(
      "INSERT INTO professional_profiles (portfolio_id) VALUES ($1)",
      [rows[0].id]
    );
    await db.query("INSERT INTO chatbot_configs (portfolio_id) VALUES ($1)", [
      rows[0].id,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/:portfolioId", requireOwnedPortfolio, async (req, res, next) => {
  try {
    const portfolio = await db.query(
      "SELECT p.*, row_to_json(pp.*) AS profile FROM portfolios p LEFT JOIN professional_profiles pp ON pp.portfolio_id = p.id WHERE p.id = $1",
      [req.params.portfolioId]
    );
    const [skills, projects, experiences, certifications] = await Promise.all(
      ["skills", "projects", "experiences", "certifications"].map((table) =>
        db.query(`SELECT * FROM ${table} WHERE portfolio_id = $1 ORDER BY id`, [
          req.params.portfolioId,
        ])
      )
    );
    res.json({
      ...portfolio.rows[0],
      skills: skills.rows,
      projects: projects.rows,
      experiences: experiences.rows,
      certifications: certifications.rows,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:portfolioId/profile",
  requireOwnedPortfolio,
  async (req, res, next) => {
    try {
      const profile = z
        .object({
          fullName: z.string().max(120),
          headline: z.string().max(180),
          bio: z.string().max(4000),
          location: z.string().max(120).nullable().optional(),
          email: z.string().email().nullable().optional(),
          websiteUrl: z.string().url().nullable().optional(),
        })
        .parse(req.body);
      const { rows } = await db.query(
        "UPDATE professional_profiles SET full_name = $1, headline = $2, bio = $3, location = $4, email = $5, website_url = $6, updated_at = now() WHERE portfolio_id = $7 RETURNING *",
        [
          profile.fullName,
          profile.headline,
          profile.bio,
          profile.location ?? null,
          profile.email ?? null,
          profile.websiteUrl ?? null,
          req.params.portfolioId,
        ]
      );
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:portfolioId/skills",
  requireOwnedPortfolio,
  async (req, res, next) => {
    try {
      const input = z
        .object({
          name: z.string().min(1).max(80),
          category: z.string().max(80).optional(),
          proficiency: z.number().int().min(1).max(5).optional(),
        })
        .parse(req.body);
      const { rows } = await db.query(
        "INSERT INTO skills (portfolio_id, name, category, proficiency) VALUES ($1, $2, $3, $4) RETURNING *",
        [
          req.params.portfolioId,
          input.name,
          input.category ?? null,
          input.proficiency ?? null,
        ]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:portfolioId/experiences",
  requireOwnedPortfolio,
  async (req, res, next) => {
    try {
      const input = z
        .object({
          company: z.string().min(1).max(160),
          role: z.string().min(1).max(160),
          summary: z.string().max(4000).optional(),
          startDate: z.string().date(),
          endDate: z.string().date().nullable().optional(),
          isCurrent: z.boolean().optional(),
        })
        .parse(req.body);
      const { rows } = await db.query(
        "INSERT INTO experiences (portfolio_id, company, role, summary, start_date, end_date, is_current) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          req.params.portfolioId,
          input.company,
          input.role,
          input.summary ?? "",
          input.startDate,
          input.isCurrent ? null : input.endDate ?? null,
          input.isCurrent ?? false,
        ]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:portfolioId/projects",
  requireOwnedPortfolio,
  async (req, res, next) => {
    try {
      const input = z
        .object({
          title: z.string().min(1).max(180),
          summary: z.string().max(4000).optional(),
          projectUrl: z.string().url().nullable().optional(),
          repositoryUrl: z.string().url().nullable().optional(),
          featured: z.boolean().optional(),
        })
        .parse(req.body);
      const { rows } = await db.query(
        "INSERT INTO projects (portfolio_id, title, summary, project_url, repository_url, featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          req.params.portfolioId,
          input.title,
          input.summary ?? "",
          input.projectUrl ?? null,
          input.repositoryUrl ?? null,
          input.featured ?? false,
        ]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

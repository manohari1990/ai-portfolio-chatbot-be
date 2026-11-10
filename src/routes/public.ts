import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/portfolios/:slug", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT p.id, p.name, p.slug, row_to_json(pp.*) AS profile FROM portfolios p JOIN professional_profiles pp ON pp.portfolio_id = p.id WHERE p.slug = $1 AND p.status = 'published'",
      [req.params.slug]
    );
    if (!rows[0])
      return res.status(404).json({ error: "Published portfolio not found." });
    const portfolio = rows[0];
    const [skills, projects, experiences] = await Promise.all(
      ["skills", "projects", "experiences"].map((table) =>
        db.query(
          `SELECT * FROM ${table} WHERE portfolio_id = $1 ORDER BY sort_order, id`,
          [portfolio.id]
        )
      )
    );
    res.json({
      ...portfolio,
      skills: skills.rows,
      projects: projects.rows,
      experiences: experiences.rows,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

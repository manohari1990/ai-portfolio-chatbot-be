import type { Response, NextFunction } from "express";
import { db } from "../db.js";
import type { AuthenticatedRequest } from "./auth.js";

export async function requireOwnedPortfolio(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const { rows } = await db.query(
    "SELECT id FROM portfolios WHERE id = $1 AND owner_id = $2",
    [req.params.portfolioId, req.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: "Portfolio not found." });
  next();
}

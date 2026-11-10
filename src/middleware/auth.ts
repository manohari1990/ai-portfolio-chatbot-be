import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthenticatedRequest = Request & { userId?: string };

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token)
    return res.status(401).json({ error: "Authentication is required." });
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Your session is invalid or has expired." });
  }
}

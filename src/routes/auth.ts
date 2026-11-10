import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db.js";
import { config } from "../config.js";

const router = Router();
const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    const displayName = z.string().min(2).max(80).parse(req.body.displayName);
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
      "INSERT INTO platform_users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name",
      [email.toLowerCase(), passwordHash, displayName]
    );
    const user = result.rows[0];
    console.log(user.id, "=====user");
    let baseSlug = slugify(displayName) || "my-portfolio";
    const portfolio = await db.query(
      "INSERT INTO portfolios (owner_id, name, slug) VALUES ($1, $2, $3) RETURNING id, name, slug",
      [user.id, `${displayName} Portfolio`, baseSlug]
    );
    await db.query(
      "INSERT INTO professional_profiles (portfolio_id, full_name) VALUES ($1, $2)",
      [portfolio.rows[0].id, displayName]
    );
    await db.query("INSERT INTO chatbot_configs (portfolio_id) VALUES ($1)", [
      portfolio.rows[0].id,
    ]);
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
      expiresIn: "7d",
    });
    res
      .status(201)
      .json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
        },
        portfolio: portfolio.rows[0],
      });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    const result = await db.query(
      "SELECT id, email, display_name, password_hash FROM platform_users WHERE email = $1",
      [email.toLowerCase()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Email or password is incorrect." });
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.display_name },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signout", async (req, res, next) => {
  try {
    console.log(req.headers.authorization, "=====signout");
    
    // Invalidate the token on the client side by removing it from local storage or cookies.
    // Optionally, you can implement server-side token blacklisting if needed.
    res.json({ message: "Signed out successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;

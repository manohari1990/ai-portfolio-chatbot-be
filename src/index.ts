import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import portfolioRoutes from "./routes/portfolios.js";
import publicRoutes from "./routes/public.js";

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/public", publicRoutes);
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof ZodError)
      return res
        .status(400)
        .json({ error: "Invalid request.", details: error.flatten() });
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    )
      return res
        .status(409)
        .json({ error: "That email or portfolio slug is already in use." });
    console.error(error);
    res.status(500).json({ error: "Unexpected server error." });
  }
);

app.listen(config.port, () =>
  console.log(`Portfolio API listening on http://localhost:${config.port}`)
);

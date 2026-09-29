import { includes } from "zod";
import { db } from "../../prisma/db";
import type {
  CreatePortfolioInput,
  UpdatePortfolioInput,
} from "./schema";

export class PortfolioService {
  static async create(
    userId: string,
    data: CreatePortfolioInput
  ) {
    // Check whether the slug already exists
    const existingPortfolio =
      await db.orm.public.Portfolio
        .where({
          slug: data.slug
        })
        .first()

    if (existingPortfolio) {
      data.slug = `${data.slug}_${Math.floor(Math.random() * 90000) + 10000}`
    }
    const portfolio =
      await db.orm.public.Portfolio.create({
        user_id: userId,
        ...data
      });
    return portfolio;
  }

  static async getById(
    userId: string,
    portfolioId: string
  ) {
    const portfolio =
      await db.orm.public.Portfolio
        .where({
          portfolio_id: portfolioId,
          user_id: userId
        })
        .include("skill")
        .include("certification")
        .include("experience")
        .include("project")
        .first()

    if (!portfolio) {
      const error = new Error("Portfolio not found");

      (error as Error & { statusCode?: number }).statusCode = 404;

      throw error;
    }

    return portfolio;
  }

  static async update(
    userId: string,
    portfolioId: string,
    data: UpdatePortfolioInput
  ) {
    // Make sure this portfolio belongs to the authenticated user
    const existingPortfolio =
      await db.orm.public.Portfolio.where({
          portfolio_id: portfolioId,
          user_id: userId,
      });
    if (!existingPortfolio) {
      const error = new Error("Portfolio not found");
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    const updatedPortfolio =
      await db.orm.public.Portfolio
      .where({
        portfolio_id: portfolioId
      }).update(data);
    return updatedPortfolio;
  }

  static async delete(
    portfolioId: string
  ) {
    const existingPortfolio =
      await db.orm.public.Portfolio
      .where({
        portfolio_id: portfolioId,
      })
      .delete();

    if (!existingPortfolio) {
      const error = new Error("Portfolio not found");
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }
  }
}
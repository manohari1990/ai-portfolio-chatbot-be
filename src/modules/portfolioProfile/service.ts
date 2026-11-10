import { db } from "../../db";

export const CreatePortfolioProfile = async (
  portfolioId: string,
  userId: string,
  data: {
    total_exp_years: number;
    bio: string;
    github_url?: string;
    linkedin_url?: string;
    resume_file_id?: string;
  }
) => {

  // Verify portfolio ownership
  const portfolio = await db.orm.public.Portfolio
    .where({
      portfolio_id: portfolioId,
      user_id: userId,
    })
    .first();

  if (!portfolio) {
    throw new Error("Portfolio not found");
  }

  // Check whether profile already exists
  const existingProfile =
    await db.orm.public.ProfessionalProfile
      .where({
        portfolio_id: portfolioId,
      })
      .first();

  if (existingProfile) {
    throw new Error("Professional profile already exists");
  }

  const profile =
    await db.orm.public.ProfessionalProfile.create({
      ...data,
      portfolio_id: portfolioId,
    });

  return profile;
};

export const GetPortfolioProfile = async (
  portfolioId: string,
  userId: string
) => {

  const portfolio = await db.orm.public.Portfolio
    .where({
      portfolio_id: portfolioId,
      user_id: userId,
    })
    .first();

  if (!portfolio) {
    throw new Error("Portfolio not found");
  }

  const profile =
    await db.orm.public.ProfessionalProfile
      .where({
        portfolio_id: portfolioId,
      })
      .first();

  if (!profile) {
    throw new Error("Professional profile not found");
  }

  return profile;
};

export const UpdatePortfolioProfile = async (
  portfolioId: string,
  userId: string,
  data: {
    total_exp_years?: number;
    bio?: string;
    github_url?: string;
    linkedin_url?: string;
    resume_file_id?: string;
  }
) => {

  const portfolio = await db.orm.public.Portfolio
    .where({
      portfolio_id: portfolioId,
      user_id: userId,
    })
    .first();

  if (!portfolio) {
    throw new Error("Portfolio not found");
  }

  const profile =
    await db.orm.public.ProfessionalProfile
      .where({
        portfolio_id: portfolioId,
      })
      .first();

  if (!profile) {
    throw new Error("Professional profile not found");
  }

  await db.orm.public.ProfessionalProfile
    .where({
      portfolio_id: portfolioId,
    })
    .update(data);

  return {
    ...profile,
    ...data,
  };
};

export const DeletePortfolioProfile = async (
  portfolioId: string,
  userId: string
) => {

  const portfolio = await db.orm.public.Portfolio
    .where({
      portfolio_id: portfolioId,
      user_id: userId,
    })
    .first();

  if (!portfolio) {
    throw new Error("Portfolio not found");
  }

  const profile =
    await db.orm.public.ProfessionalProfile
      .where({
        portfolio_id: portfolioId,
      })
      .first();

  if (!profile) {
    throw new Error("Professional profile not found");
  }

  await db.orm.public.ProfessionalProfile
    .where({
      portfolio_id: portfolioId,
    })
    .delete();

  return true;
};


import { Request, Response } from "express";
import {
  CreatePortfolioProfile,
  GetPortfolioProfile,
  UpdatePortfolioProfile,
  DeletePortfolioProfile,
} from "./service";

import {
  portfolioProfileSchema,
} from "./schema";

import { AuthenticatedRequest } from "../../types/auth";

export const CreateProfile = async (
  request: AuthenticatedRequest,
  response: Response
) => {

  try {

    const portfolioId = request.params.portfolioId;

    const validation =
      portfolioProfileSchema.safeParse(request.body);

    if (!validation.success) {
      return response.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const userId = request.user.user_id;

    const profile = await CreatePortfolioProfile(
      portfolioId,
      userId,
      validation.data
    );

    return response.status(201).json({
      success: true,
      message: "Professional profile created successfully",
      data: profile,
    });

  } catch (error) {

    console.error("Create profile error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to create professional profile",
    });
  }
};

export const GetProfile = async (
  request: AuthenticatedRequest,
  response: Response
) => {

  try {

    const portfolioId = request.params.portfolioId;

    const userId = request.user.user_id;

    const profile = await GetPortfolioProfile(
      portfolioId,
      userId
    );

    return response.status(200).json({
      success: true,
      data: profile,
    });

  } catch (error) {

    console.error("Get profile error:", error);

    return response.status(404).json({
      success: false,
      message: "Professional profile not found",
    });
  }
};


export const UpdateProfile = async (
  request: AuthenticatedRequest,
  response: Response
) => {

  try {

    const portfolioId = request.params.portfolioId;

    const validation =
      updatePortfolioProfileSchema.safeParse(request.body);

    if (!validation.success) {
      return response.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const userId = request.user.user_id;

    const profile = await UpdatePortfolioProfile(
      portfolioId,
      userId,
      validation.data
    );

    return response.status(200).json({
      success: true,
      message: "Professional profile updated successfully",
      data: profile,
    });

  } catch (error) {

    console.error("Update profile error:", error);

    return response.status(404).json({
      success: false,
      message: "Professional profile not found",
    });
  }
};



export const DeleteProfile = async (
  request: AuthenticatedRequest,
  response: Response
) => {

  try {

    const portfolioId = request.params.portfolioId;

    const userId = request.user.user_id;

    await DeletePortfolioProfile(
      portfolioId,
      userId
    );

    return response.status(200).json({
      success: true,
      message: "Professional profile deleted successfully",
    });

  } catch (error) {

    console.error("Delete profile error:", error);

    return response.status(404).json({
      success: false,
      message: "Professional profile not found",
    });
  }
};



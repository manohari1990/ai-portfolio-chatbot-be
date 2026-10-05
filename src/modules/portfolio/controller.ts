import type { Response } from "express";
import {
  createPortfolioSchema,
  getPortfoliosQuerySchema,
  portfolioIdSchema,
  updatePortfolioSchema,
} from "./schema";
import { PortfolioService } from "./service";
import type { AuthenticatedRequest } from "./types";
import { success } from "zod";

export const NewPortfolio = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  try {
    /*
     * Temporary until authentication middleware exists.
     *
     * In production this MUST come from req.user.
     */
    const userId = request.body.user_id;

    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validation =
      createPortfolioSchema.safeParse(
        request.body
      );

    if (!validation.success) {
      return response.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const portfolio =
      await PortfolioService.create(
        userId,
        validation.data
      );

    return response.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      data: portfolio,
    });
  } catch (error) {
    console.error(
      "Create portfolio error:",
      error
    );

    const statusCode =
      (error as Error & {
        statusCode?: number;
      }).statusCode ?? 500;

    return response.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : (error as Error).message,
    });
  }
};


export const GetPortfolioByUser = async ( request: AuthenticatedRequest, response: Response ) => {
  try {
    const validation = getPortfoliosQuerySchema.safeParse(request.params);
    if (!validation.success) {
      return response.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.issues,
      });
    }

    const portfolio = await PortfolioService.getByUserId(validation.data.user_id);
    return response.status(200).json({
      success: true,
      data: portfolio,
    });

  } catch (err) {
    console.error( "Fetch Portfolio error: ", err )
    const statusCode = (err as Error & {
      statusCode?: number;
    }).statusCode ?? 500
    return response.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? "Internal Server Error" : (err as Error).message
    })
  }
}

export const GetAllPortfolio = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  try {
    const validation = getPortfoliosQuerySchema.safeParse(request.query);

    if (!validation.success) {
      return response.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.issues,
      });
    }
    const portfolio =
      await PortfolioService.getById(
        validation.data.user_id,
        validation.data.id
      );

    return response.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error(
      "Get portfolio error:",
      error
    );

    const statusCode =
      (error as Error & {
        statusCode?: number;
      }).statusCode ?? 500;

    return response.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : (error as Error).message,
    });
  }
};

export const UpdatePortfolio = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  try {
    const userId = request.body.user_id;
    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const paramsValidation =
      portfolioIdSchema.safeParse(
        request.params
      );

    if (!paramsValidation.success) {
      return response.status(400).json({
        success: false,
        message: "Invalid portfolio ID",
        errors: paramsValidation.error.issues,
      });
    }
    const bodyValidation =
      updatePortfolioSchema.safeParse(
        request.body
      );

    if (!bodyValidation.success) {
      return response.status(400).json({
        success: false,
        message: "Validation failed",
        errors: bodyValidation.error.issues,
      });
    }
    const portfolio =
      await PortfolioService.update(
        userId,
        paramsValidation.data?.id,
        bodyValidation.data
      );

    return response.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      data: portfolio,
    });
  } catch (error) {
    console.error(
      "Update portfolio error:",
      error
    );

    const statusCode =
      (error as Error & {
        statusCode?: number;
      }).statusCode ?? 500;

    return response.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : (error as Error).message,
    });
  }
};

export const DeletePortfolio = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  try {
    const userId = request.body.user_id;
    console.log(userId, "==================userId")
    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validation =
      portfolioIdSchema.safeParse(
        request.params
      );
    console.log(validation, "===================validation")

    if (!validation.success) {
      return response.status(400).json({
        success: false,
        message: "Invalid portfolio ID",
        errors: validation.error.issues,
      });
    }

    await PortfolioService.delete(
      validation.data.id
    );

    return response.status(204).send();
  } catch (error) {
    console.error(
      "Delete portfolio error:",
      error
    );

    const statusCode =
      (error as Error & {
        statusCode?: number;
      }).statusCode ?? 500;

    return response.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : (error as Error).message,
    });
  }
};
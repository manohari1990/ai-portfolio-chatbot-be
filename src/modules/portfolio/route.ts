import { Router } from "express";
import {
  NewPortfolio,
  GetAllPortfolio,
  UpdatePortfolio,
  DeletePortfolio,
  GetPortfolioByUser
} from "./controller";

const portfolioRouter = Router();
portfolioRouter.post("/", NewPortfolio);
portfolioRouter.get("/:user_id", GetPortfolioByUser);
portfolioRouter.get("/", GetAllPortfolio);
portfolioRouter.put("/:id", UpdatePortfolio);
portfolioRouter.delete("/:id", DeletePortfolio);

export default portfolioRouter;
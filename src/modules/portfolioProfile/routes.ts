import { Router } from "express";

import {
  CreateProfile,
  GetProfile,
  UpdateProfile,
  DeleteProfile,
} from "./controller";

const portfolioProfileRouter = Router();

portfolioProfileRouter.post(
  "/:portfolioId/profile",
  CreateProfile
);

portfolioProfileRouter.get(
  "/:portfolioId/profile",
  GetProfile
);

portfolioProfileRouter.put(
  "/:portfolioId/profile",
  UpdateProfile
);

portfolioProfileRouter.delete(
  "/:portfolioId/profile",
  DeleteProfile
);

export default portfolioProfileRouter;
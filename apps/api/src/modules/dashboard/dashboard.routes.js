import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireActiveSubscription } from "../../middleware/subscription.middleware.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireActiveSubscription,
  dashboardController
);

export default router;
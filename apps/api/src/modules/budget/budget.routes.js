import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireActiveSubscription } from "../../middleware/subscription.middleware.js";
import {
  listBudgetsRest,
  getBudgetRest,
  createBudgetRest,
  updateBudgetRest,
  deleteBudgetRest,
  restoreBudgetRest,
} from "./budget.controller.js";

const router = Router();

router.get("/", requireAuth, requireActiveSubscription, listBudgetsRest);
router.get("/:id", requireAuth, requireActiveSubscription, getBudgetRest);
router.post("/", requireAuth, requireActiveSubscription, createBudgetRest);
router.patch("/:id", requireAuth, requireActiveSubscription, updateBudgetRest);
router.delete("/:id", requireAuth, requireActiveSubscription, deleteBudgetRest);
router.post("/:id/restore", requireAuth, requireActiveSubscription, restoreBudgetRest);

export default router;

import { Router } from "express";
import { requireInternalAuth } from "../../middleware/internal-auth.middleware.js";
import * as ctrl from "./internal-auth.controller.js";

const router = Router();

router.post("/login", ctrl.login);
router.post("/logout", requireInternalAuth, ctrl.logout);
router.get("/me", requireInternalAuth, ctrl.me);
router.put("/change-password", requireInternalAuth, ctrl.changePassword);

export default router;

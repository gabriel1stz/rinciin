import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { otpLimiter, authLimiter } from "../../middleware/rate-limit.middleware.js";
import {
  requestOtp,
  verifyOtp,
  googleAuth,
  refreshToken,
  logoutHandler,
  me,
  updateProfileHandler,
  getSessions,
  revokeSession,
  deleteAccount,
} from "./auth.controller.js";

const router = Router();

router.post("/login", otpLimiter, requestOtp);
router.post("/send-otp", otpLimiter, requestOtp);
router.post("/verify", authLimiter, verifyOtp);
router.post("/google", authLimiter, googleAuth);

router.post("/session-from-order", (req, res, next) => {
  import("./auth.controller.js").then((c) => c.sessionFromOrder(req, res, next));
});
router.post("/refresh", refreshToken);
router.post("/logout", logoutHandler);
router.get("/me", requireAuth, me);

router.put("/me", requireAuth, updateProfileHandler);
router.get("/sessions", requireAuth, getSessions);
router.delete("/sessions/:id", requireAuth, revokeSession);
router.delete("/account", requireAuth, deleteAccount);

export default router;

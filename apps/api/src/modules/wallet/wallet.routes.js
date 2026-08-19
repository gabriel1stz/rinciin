import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireActiveSubscription } from "../../middleware/subscription.middleware.js";
import {
  // NLP (WhatsApp) — phone-based
  getWallets,
  detail,
  create,
  update,
  remove,
  transferWallet,
  addBalance,
  subtractBalance,

  // REST — authenticated
  listWalletsRest,
  getWalletRest,
  createWalletRest,
  updateWalletRest,
  deleteWalletRest,
  transferWalletRest,
  archiveWalletRest,
  restoreWalletRest,
} from "./wallet.controller.js";

const router = Router();

// ==========================================
// REST CRUD — authenticated via JWT & active subscription
// ==========================================
router.get("/", requireAuth, requireActiveSubscription, listWalletsRest);
router.get("/detail/:id", requireAuth, requireActiveSubscription, getWalletRest);
router.post("/", requireAuth, requireActiveSubscription, createWalletRest);
router.patch("/:id", requireAuth, requireActiveSubscription, updateWalletRest);
router.delete("/:id", requireAuth, requireActiveSubscription, deleteWalletRest);
router.post("/transfer", requireAuth, requireActiveSubscription, transferWalletRest);
router.post("/:id/archive", requireAuth, requireActiveSubscription, archiveWalletRest);
router.post("/:id/restore", requireAuth, requireActiveSubscription, restoreWalletRest);

// ==========================================
// NLP (WhatsApp) — no auth, uses phone param
// ==========================================
router.get("/:phone", getWallets);
router.get("/detail/:id", detail);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.post("/transfer", transferWallet);
router.post("/add", addBalance);
router.post("/subtract", subtractBalance);

export default router;

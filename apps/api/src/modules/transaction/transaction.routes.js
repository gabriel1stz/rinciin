import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireActiveSubscription } from "../../middleware/subscription.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import {
  processTransaction,
  getTransactions,
  listTransactionsRest,
  getTransactionRest,
  createTransactionRest,
  updateTransactionRest,
  deleteTransactionRest,
  restoreTransactionRest,
  uploadReceipt
} from "./transaction.controller.js";

const router = Router();

// REST CRUD — authenticated via JWT & active subscription
router.get("/", requireAuth, requireActiveSubscription, listTransactionsRest);
router.get("/detail/:id", requireAuth, requireActiveSubscription, getTransactionRest);
router.post("/", requireAuth, requireActiveSubscription, createTransactionRest);
router.patch("/:id", requireAuth, requireActiveSubscription, updateTransactionRest);
router.delete("/:id", requireAuth, requireActiveSubscription, deleteTransactionRest);
router.post("/:id/restore", requireAuth, requireActiveSubscription, restoreTransactionRest);
router.post("/:id/upload", requireAuth, requireActiveSubscription, upload.single("receipt"), uploadReceipt);

// NLP (WhatsApp) — no auth, uses phone param
router.post("/process", processTransaction);
router.get("/:phone", getTransactions);

export default router;

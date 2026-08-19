import { Router } from "express";
import {
  createPayment,
  handleCallback,
  getPaymentStatus,
  cancelPayment,
  simulatePayment,
  getPlans
} from "./payment.controller.js";

const router = Router();

router.get("/plans", getPlans);
router.post("/create", createPayment);
router.post("/callback", handleCallback);
router.post("/webhook", handleCallback);
router.get("/status/:orderId", getPaymentStatus);
router.post("/cancel/:orderId", cancelPayment);
router.post("/simulate/:orderId", simulatePayment);

export default router;
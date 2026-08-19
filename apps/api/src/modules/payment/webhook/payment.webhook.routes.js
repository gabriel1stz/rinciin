import { Router } from "express";
import { webhook } from "./payment.webhook.controller.js";

const router = Router();

router.post("/", webhook);

export default router;
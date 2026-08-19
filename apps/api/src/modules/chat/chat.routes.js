import { Router } from "express";
import { processChat } from "./chat.controller.js";

const router = Router();

router.post("/", processChat);

export default router;
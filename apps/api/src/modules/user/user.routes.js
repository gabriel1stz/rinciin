import { Router } from "express";
import { registerTrial, getUser } from "./user.controller.js";

const router = Router();

router.post("/trial", registerTrial);
router.get("/:phone", getUser);

export default router;
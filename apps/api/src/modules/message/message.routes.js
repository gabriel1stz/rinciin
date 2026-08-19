import { Router } from "express";
import { process } from "./message.controller.js";

const router = Router();

router.post("/process", process);

export default router;
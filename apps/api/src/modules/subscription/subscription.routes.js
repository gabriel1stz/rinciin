import { Router } from "express";
import { getSubscription, activateSubscription } from "./subscription.controller.js";

const router = Router();

router.get("/:phone", getSubscription);
router.post("/activate", activateSubscription);

export default router;
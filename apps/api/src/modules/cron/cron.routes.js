import { Router } from "express";
import { executeWeeklySummary, executeMonthlySummary, executeDailyReminder } from "./cron.service.js";

const router = Router();

router.post("/weekly-recap", async (req, res) => {
  try {
    const result = await executeWeeklySummary();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/monthly-recap", async (req, res) => {
  try {
    const result = await executeMonthlySummary();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/daily-reminder", async (req, res) => {
  try {
    const result = await executeDailyReminder();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;


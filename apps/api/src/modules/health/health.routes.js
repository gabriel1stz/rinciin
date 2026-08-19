import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "Rinci.in API",
    uptime: process.uptime(),
    time: new Date().toISOString()
  });
});

export default router;
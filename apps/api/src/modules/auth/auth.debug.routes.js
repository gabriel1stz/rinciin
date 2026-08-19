import { Router } from "express";
import prisma from "../../lib/prisma.js";

const router = Router();

// Debug-only endpoints (no auth required)

router.get("/ping", (req, res) => {
  res.json({ success: true, message: "Auth routes OK" });
});

router.get("/dev/otp/:phone", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const { phone } = req.params;
  const cleanPhone = String(phone).replace(/\D/g, "");

  const otp = await prisma.otp.findFirst({
    where: { phone: cleanPhone },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return res.status(404).json({ success: false, message: "OTP not found" });
  }

  res.json({
    success: true,
    data: { otp: otp.code, expiresAt: otp.expiresAt },
  });
});

export default router;

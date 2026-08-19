import prisma from "../lib/prisma.js";
import { fail } from "../utils/response.js";

export async function requireActiveSubscription(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!user) {
      return fail(res, "User not found", 404);
    }

    const userTier = (user.tier || "").toUpperCase();
    if (userTier === "SUPER_ADMIN" || userTier === "ADMIN") {
      return next();
    }

    const latestSub = user.subscription?.[0];
    const subPlan = (latestSub?.plan || "").toUpperCase();
    const subStatus = (latestSub?.status || "").toUpperCase();
    const isExpired = latestSub?.expiresAt && new Date(latestSub.expiresAt) < new Date();

    const isProOrFamily =
      (userTier === "PRO" || userTier === "FAMILY" || subPlan === "PRO" || subPlan === "FAMILY") &&
      (!isExpired || !latestSub?.expiresAt);

    const isTrialActive =
      (userTier === "TRIAL" || subPlan === "TRIAL") &&
      !isExpired &&
      (subStatus === "ACTIVE" || subStatus === "PAID" || !subStatus);

    if (isProOrFamily || isTrialActive) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: "SUBSCRIPTION_EXPIRED",
      message: "Masa uji coba (Trial) kamu telah berakhir. Silakan upgrade ke paket PRO atau Family untuk melanjutkan akses dashboard.",
      expiresAt: latestSub?.expiresAt || null
    });
  } catch (err) {
    console.error("❌ Subscription Middleware Error:", err.message);
    return fail(res, "Gagal memverifikasi status langganan", 500);
  }
}

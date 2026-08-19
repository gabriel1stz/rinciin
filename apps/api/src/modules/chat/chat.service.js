import { detectIntent } from "../../core/intent/intent.core.js";
import { getOrCreateUser } from "../user/user.service.js";
import * as handlers from "./handlers/index.js";
import prisma from "../../lib/prisma.js";
import { updateUserTier } from "../user/repositories/user.repository.js";
import { createOrUpdateSubscription } from "../subscription/repositories/subscription.repository.js";
import { getUserSubscription } from "../subscription/subscription.service.js";
import {
  formatSubscriptionRequired,
  formatLimitReached
} from "../formatter/subscription.formatter.js";

export async function processIncomingMessage(body) {
  const text = (body.message || body.text || "").trim();
  const lower = text.toLowerCase();

  const user = await getOrCreateUser(
    body.phone,
    body.name
  );

  // ==========================
  // CEK SUBSCRIPTION
  // ==========================
  const subscription = await getUserSubscription(user.id);
  const userTier = (user?.tier || "").toUpperCase();
  const subPlan = (subscription?.plan || "").toUpperCase();
  const subStatus = (subscription?.status || "").toUpperCase();
  const isExpired = subscription?.expiresAt && new Date(subscription.expiresAt) < new Date();

  const isProOrFamily =
    (userTier === "PRO" || userTier === "FAMILY" || subPlan === "PRO" || subPlan === "FAMILY") &&
    (!isExpired || !subscription?.expiresAt);

  const isTrialActive =
    (userTier === "TRIAL" || subPlan === "TRIAL") &&
    !isExpired &&
    (subStatus === "ACTIVE" || subStatus === "PAID" || !subStatus);

  // ==========================
  // AKTIVASI TRIAL VIA WHATSAPP TOKEN / PERINTAH
  // ==========================
  const isTrialClaim =
    lower.startsWith("aktifkan trial") ||
    lower.startsWith("klaim trial") ||
    lower.startsWith("claim trial") ||
    lower.startsWith("start trial") ||
    lower.startsWith("mulai trial") ||
    /^trial-[a-z0-9]+/i.test(text);

  if (isTrialClaim) {
    if (isProOrFamily) {
      return {
        success: true,
        type: "ALREADY_PRO",
        text: `✨ Halo ${body.name || "kak"}! Akun WhatsApp kamu saat ini sudah berstatus *PRO* aktif dengan akses *unlimited*.\n\nKamu tidak perlu mengaktifkan masa Trial. Silakan ketik *menu* atau langsung mulai catat transaksi keuanganmu! 🚀`
      };
    }

    const clean = String(body.phone || user.phone || "").replace(/\D/g, "");
    const withoutZero = clean.startsWith("0") ? clean.slice(1) : clean.startsWith("62") ? clean.slice(2) : clean;
    const phoneVariations = [clean, "0" + withoutZero, "62" + withoutZero];

    const existingTrialPayment = await prisma.payment.findFirst({
      where: {
        phone: { in: phoneVariations },
        plan: { in: ["TRIAL", "trial", "free", "FREE"] },
        status: "PAID"
      }
    });

    const existingTrialSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        plan: { in: ["TRIAL", "trial", "free", "FREE"] }
      }
    });

    if (isTrialActive) {
      const expStr = subscription?.expiresAt
        ? new Date(subscription.expiresAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })
        : "7 Hari";
      const webUrl = process.env.WEB_URL || process.env.FRONTEND_URL || "https://rinciin.my.id";
      return {
        success: true,
        type: "ALREADY_TRIAL",
        text: `✨ Akun kamu saat ini sedang dalam masa *TRIAL* aktif (s/d ${expStr}).\n\nKamu sudah bisa langsung menggunakan seluruh fitur bot dan dashboard.\n🌐 *Web Dashboard:* ${webUrl}/login\n\nSilakan ketik *menu* atau langsung mulai catat transaksi keuanganmu! 🚀`
      };
    }

    if (existingTrialPayment || existingTrialSub) {
      const pricingUrl = process.env.PRICING_URL || "https://rinciin.my.id/#pricing";
      return {
        success: false,
        type: "TRIAL_ALREADY_USED",
        text: `❌ Nomor WhatsApp ini sudah pernah menggunakan masa Trial gratis (7 Hari).\n\nUntuk terus menikmati kemudahan catat keuangan otomatis tanpa batas, silakan upgrade ke paket PRO di sini:\n👉 ${pricingUrl}`
      };
    }

    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7); // 7 Hari

    await updateUserTier(user.id, "TRIAL");
    await createOrUpdateSubscription({
      userId: user.id,
      plan: "TRIAL",
      status: "ACTIVE",
      amount: 0,
      orderId: `TRIAL-${Date.now().toString(36).toUpperCase()}`,
      paymentMethod: "trial_token",
      expiredAt
    });

    const expiredStr = expiredAt.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const webUrl = process.env.WEB_URL || process.env.FRONTEND_URL || "https://rinciin.my.id";
    const dashboardLoginUrl = `${webUrl}/login`;

    return {
      success: true,
      type: "TRIAL_ACTIVATED",
      text: `🎉 *TRIAL 7 HARI BERHASIL DIAKTIFKAN!*\n━━━━━━━━━━━━━━\nHalo kak *${body.name || "Sobat Rinci"}*! Selamat datang di Rinci.in.\n\n✨ *Masa Uji Coba:* 7 Hari (s/d ${expiredStr})\n🚀 *Status Akun:* TRIAL (Akses Penuh WhatsApp & Dashboard)\n\n🌐 *Link Akses Web Dashboard:*\n👉 ${dashboardLoginUrl}\n*(Masuk dengan nomor WhatsApp ini untuk verifikasi OTP)*\n\nYuk langsung coba fitur-fitur praktis ini:\n👉 Ketik: *makan siang 35rb shopeepay*\n👉 Ketik: *gaji 5jt bca*\n👉 Ketik: *top up gopay 100rb*\n👉 Ketik: *transfer bca ke shopeepay 200rb*\n👉 Kirim *Foto Struk* 📸 / *Voice Note* 🎙️\n👉 Ketik: *saldo* (cek semua dompet)\n👉 Ketik: *menu* (bantuan lengkap)\n\nSelamat mencoba! 🧑‍💻`
    };
  }

  if (!isProOrFamily && !isTrialActive) {
    return {
      success: false,
      type: "SUBSCRIPTION_REQUIRED",
      text: formatSubscriptionRequired(Boolean(isExpired))
    };
  }

  if (
    !isProOrFamily &&
    subscription?.remainingChat !== undefined &&
    subscription.remainingChat <= 0
  ) {
    return {
      success: false,
      type: "LIMIT_REACHED",
      text: formatLimitReached()
    };
  }

  // ==========================
  // FOTO STRUK / GAMBAR OCR
  // ==========================
  if (body.image) {
    console.log("========== RECEIPT OCR ==========");
    console.log("Phone  :", body.phone);
    console.log("Caption:", text);
    console.log("=================================");
    return await handlers.receiptHandler(body, user);
  }

  // ==========================
  // VOICE NOTE / AUDIO
  // ==========================
  if (body.audio) {
    console.log("========== VOICE NOTE ==========");
    console.log("Phone  :", body.phone);
    console.log("================================");
    return await handlers.voiceHandler(body, user, processIncomingMessage);
  }


  const intent = detectIntent(text);

  console.log("========== CHAT ==========");
  console.log("Phone :", body.phone);
  console.log("Text  :", text);
  console.log("Intent:", intent);
  console.log("==========================");

  const handler = handlers[intent] ?? handlers.unknownHandler;

  body.intent = intent;
  body.message = text;

  return await handler(body, user);
}

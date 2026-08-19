import { mono, divider, blank } from "../../helpers/message.helper.js";

export function formatSubscriptionRequired(isExpired = false) {
  const pricingUrl = process.env.PRICING_URL || "https://gabriel1stz-rinciinn.vercel.app/#pricing";

  return mono([
    divider(),
    blank(),

    isExpired
      ? "⌛ *Masa Trial (7 Hari) kamu telah berakhir.*"
      : "🎁 *Kamu belum memiliki paket langganan aktif.*",

    blank(),

    "Seluruh fitur WhatsApp Bot & Dashboard terkunci.",
    "Upgrade ke paket *PRO* atau *FAMILY* agar dapat",
    "terus mencatat keuangan tanpa batas! 🚀",

    blank(),

    "✨ Upgrade akun sekarang di:",
    `👉 ${pricingUrl}`,

    blank(),
    divider()
  ]);
}

export function formatLimitReached() {
  const pricingUrl = process.env.PRICING_URL || "https://gabriel1stz-rinciinn.vercel.app/#pricing";

  return mono([
    divider(),
    blank(),

    "🚫 Kuota chat kamu sudah habis.",

    blank(),

    "Upgrade ke PRO | FAMILY",
    "agar bisa menggunakan Rinci.in tanpa batas.",

    blank(),

    `🌍 ${pricingUrl}`,

    blank(),
    divider()
  ]);
}
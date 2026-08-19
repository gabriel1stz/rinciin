import { mono, divider, blank } from "../../helpers/message.helper.js";

export function formatSubscriptionRequired(isExpired = false) {
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
    "👉 https://rinci.in/#pricing",

    blank(),
    divider()
  ]);
}


export function formatLimitReached() {
  return mono([
    divider(),
    blank(),

    "🚫 Kuota chat kamu sudah habis.",

    blank(),

    "Upgrade ke PRO | FAMILY",
    "agar bisa menggunakan Rinci.in tanpa batas.",

    blank(),

    "🌍 https://rinci.in/#pricing",

    blank(),
    divider()
  ]);
}
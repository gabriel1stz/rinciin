// owner-alert.helper.js - Realtime Alert Dispatcher to Owner/Admin WhatsApp
import { sendWhatsAppNotification } from "./whatsapp.helper.js";

// Cache to prevent alert spamming (throttling)
let lastSystemAlertTime = 0;
const SYSTEM_ALERT_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown for server warnings

export function getOwnerPhone() {
  const phone = process.env.OWNER_PHONE || process.env.ADMIN_PHONE || "";
  return phone.replace(/\D/g, "");
}

/**
 * Send real-time payment / revenue alert to owner
 */
export async function sendOwnerPaymentAlert({ user, payment, durationDays = 30 }) {
  const ownerPhone = getOwnerPhone();
  if (!ownerPhone) return false;

  const planName = String(payment.plan || "PRO").toUpperCase();
  const amountStr = Number(payment.amount || 0).toLocaleString("id-ID");
  const phoneFormatted = user?.phone || payment.phone || "-";
  const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const message = `💰 *CUAN MASUK! (Rinci.in)*\n━━━━━━━━━━━━━━\nAda pembayaran paket baru berhasil diverifikasi:\n\n👤 *User:* ${user?.name || "User Baru"} (${phoneFormatted})\n📦 *Paket:* ${planName} (${durationDays} Hari)\n💵 *Nominal:* Rp${amountStr}\n💳 *Metode:* ${(payment.method || "QRIS").toUpperCase()}\n🧾 *Order ID:* ${payment.orderId}\n⏰ *Waktu:* ${timeStr} WIB\n\n_Server is printing money! Pantau terus di /admin_ 🚀`;

  console.log(`📢 [Owner Alert] Mengirim notifikasi cuan ke owner (+${ownerPhone})...`);
  return await sendWhatsAppNotification(ownerPhone, message);
}

/**
 * Send critical server incident alert to owner (throttled)
 */
export async function sendOwnerSystemAlert({ title, message, severity = "WARNING" }) {
  const ownerPhone = getOwnerPhone();
  if (!ownerPhone) return false;

  const now = Date.now();
  if (now - lastSystemAlertTime < SYSTEM_ALERT_COOLDOWN_MS) {
    console.log("ℹ️ [Owner Alert] System alert throttled to prevent spam.");
    return false;
  }

  lastSystemAlertTime = now;
  const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const alertMessage = `🚨 *EMERGENCY SERVER ALERT!*\n━━━━━━━━━━━━━━\n⚠️ *Severity:* ${severity}\n📌 *Problem:* ${title}\n📝 *Detail:* ${message}\n⏰ *Waktu:* ${timeStr} WIB\n\n_Segera cek status di Admin Ops Center: /admin_`;

  console.log(`🚨 [Owner Alert] Mengirim alert insiden ke owner (+${ownerPhone})...`);
  return await sendWhatsAppNotification(ownerPhone, alertMessage);
}

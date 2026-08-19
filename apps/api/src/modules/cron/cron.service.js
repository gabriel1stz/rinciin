import prisma from "../../lib/prisma.js";
import { getReport } from "../report/report.service.js";
import { formatReport } from "../formatter/report.formatter.js";
import { sendWhatsAppNotification } from "../../helpers/whatsapp.helper.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeWeeklySummary() {
  console.log("⏰ [CRON] Running Weekly Financial Recap...");

  const users = await prisma.user.findMany({
    where: {
      phone: { not: "" }
    }
  });

  let sentCount = 0;

  for (const user of users) {
    try {
      const report = await getReport(user.id, "week");

      // Only send if there were transactions or user is active
      if (report.transactionCount > 0) {
        const header = `🗓️ *REKAP MINGGUAN RINCI.IN*\nHalo kak *${user.name || "User"}*, berikut ringkasan keuangan kamu selama seminggu ini:\n\n`;
        const text = header + formatReport(report);

        await sendWhatsAppNotification(user.phone, text);
        sentCount++;
        await delay(1500); // Safe pacing delay
      }
    } catch (err) {
      console.error(`❌ Failed to send weekly recap to ${user.phone}:`, err.message);
    }
  }

  console.log(`✅ [CRON] Weekly Recap Sent to ${sentCount} users.`);
  return { success: true, sentCount, totalUsers: users.length };
}

export async function executeMonthlySummary() {
  console.log("⏰ [CRON] Running Monthly Financial Recap...");

  const users = await prisma.user.findMany({
    where: {
      phone: { not: "" }
    }
  });

  let sentCount = 0;

  for (const user of users) {
    try {
      const report = await getReport(user.id, "month");

      if (report.transactionCount > 0) {
        const header = `📅 *REKAP BULANAN RINCI.IN*\nHalo kak *${user.name || "User"}*, ini evaluasi keuangan bulanan kamu:\n\n`;
        const text = header + formatReport(report);

        await sendWhatsAppNotification(user.phone, text);
        sentCount++;
        await delay(1500); // Safe pacing delay
      }
    } catch (err) {
      console.error(`❌ Failed to send monthly recap to ${user.phone}:`, err.message);
    }
  }

  console.log(`✅ [CRON] Monthly Recap Sent to ${sentCount} users.`);
  return { success: true, sentCount, totalUsers: users.length };
}

export async function executeDailyReminder() {
  console.log("⏰ [CRON] Running Daily Night Reminder...");

  const users = await prisma.user.findMany({
    where: {
      phone: { not: "" }
    }
  });

  let sentCount = 0;

  for (const user of users) {
    try {
      const text = [
        `🌙 *PENGINGAT KEUANGAN HARIAN*`,
        `━━━━━━━━━━━━━━`,
        `Halo kak *${user.name || "User"}*! 👋`,
        ``,
        `Ada pengeluaran, jajan, atau pemasukan hari ini yang belum sempat dicatat?`,
        ``,
        `Yuk langsung ketik chat, kirim voice note, atau foto struknya sekarang biar saldo dan pembukuan tetap akurat! 🚀`,
        ``,
        `💡 _Contoh: makan siang 35rb gopay, beli bensin 50rb dana_`
      ].join("\n");

      await sendWhatsAppNotification(user.phone, text);
      sentCount++;
      await delay(1500); // Safe pacing delay
    } catch (err) {
      console.error(`❌ Failed to send daily reminder to ${user.phone}:`, err.message);
    }
  }

  console.log(`✅ [CRON] Daily Reminder Sent to ${sentCount} users.`);
  return { success: true, sentCount, totalUsers: users.length };
}


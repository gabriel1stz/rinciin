import cron from "node-cron";
import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

export function initCronJobs() {
  console.log("⏰ [CRON] Initializing Auto Rekap Scheduler...");

  // 1. Rekap Mingguan: Setiap Minggu jam 20.00 WIB
  cron.schedule(
    "0 20 * * 0",
    async () => {
      console.log("⏰ [CRON] Triggering Weekly Summary...");
      try {
        const res = await axios.post(`${API_BASE_URL}/cron/weekly-recap`);
        console.log("✅ [CRON] Weekly Summary response:", res.data);
      } catch (err) {
        console.error("❌ [CRON] Weekly Summary error:", err.message);
      }
    },
    {
      timezone: "Asia/Jakarta"
    }
  );

  // 2. Rekap Bulanan: Setiap Tanggal 1 jam 08.00 WIB
  cron.schedule(
    "0 8 1 * *",
    async () => {
      console.log("⏰ [CRON] Triggering Monthly Summary...");
      try {
        const res = await axios.post(`${API_BASE_URL}/cron/monthly-recap`);
        console.log("✅ [CRON] Monthly Summary response:", res.data);
      } catch (err) {
        console.error("❌ [CRON] Monthly Summary error:", err.message);
      }
    },
    {
      timezone: "Asia/Jakarta"
    }
  );

  // 3. Pengingat Malam Harian: Setiap Hari jam 21.00 WIB
  cron.schedule(
    "0 21 * * *",
    async () => {
      console.log("⏰ [CRON] Triggering Daily Night Reminder...");
      try {
        const res = await axios.post(`${API_BASE_URL}/cron/daily-reminder`);
        console.log("✅ [CRON] Daily Reminder response:", res.data);
      } catch (err) {
        console.error("❌ [CRON] Daily Reminder error:", err.message);
      }
    },
    {
      timezone: "Asia/Jakarta"
    }
  );

  console.log("✅ [CRON] Scheduler active (Daily: 21:00, Weekly: Sun 20:00, Monthly: 1st 08:00 WIB)");
}


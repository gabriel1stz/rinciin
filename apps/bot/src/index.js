import dotenv from "dotenv";
dotenv.config();

// Filter noisy internal logs from libsignal (Closing session / Prekey bundle)
const originalInfo = console.info;
console.info = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("Closing session:")) return;
  originalInfo(...args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("Closing open session")) return;
  originalWarn(...args);
};

// Global error handlers to prevent bot crash
process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection:", reason?.message || reason);
});

process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err?.message || err);
});

import { startBot } from "./lib/baileys.js";
import { startInternalServer } from "./server.js";
import { initCronJobs } from "./cron/scheduler.js";

startInternalServer(Number(process.env.BOT_INTERNAL_PORT) || 3001);
initCronJobs();
startBot();


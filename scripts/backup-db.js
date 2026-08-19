// scripts/backup-db.js - Automated Database Snapshot & Disaster Recovery
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runBackup() {
  console.log("🚀 Starting PostgreSQL Database Snapshot...");
  const startTime = Date.now();

  const backupDir = path.resolve(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    const [
      users,
      subscriptions,
      wallets,
      categories,
      transactions,
      budgets,
      goals,
      internalUsers,
      auditLogs,
      notifications,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.subscription.findMany(),
      prisma.wallet.findMany(),
      prisma.category.findMany(),
      prisma.transaction.findMany(),
      prisma.budget.findMany(),
      prisma.goal.findMany(),
      prisma.internalUser.findMany(),
      prisma.auditLog.findMany({ take: 5000, orderBy: { createdAt: "desc" } }),
      prisma.internalNotification.findMany({ take: 1000, orderBy: { createdAt: "desc" } }),
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `rinci-db-backup-${timestamp}.json`;
    const targetFile = path.join(backupDir, filename);

    const backupData = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      counts: {
        users: users.length,
        subscriptions: subscriptions.length,
        wallets: wallets.length,
        categories: categories.length,
        transactions: transactions.length,
        budgets: budgets.length,
        goals: goals.length,
        internalUsers: internalUsers.length,
        auditLogs: auditLogs.length,
        notifications: notifications.length,
      },
      data: {
        users,
        subscriptions,
        wallets,
        categories,
        transactions,
        budgets,
        goals,
        internalUsers,
        auditLogs,
        notifications,
      },
    };

    fs.writeFileSync(targetFile, JSON.stringify(backupData, null, 2), "utf-8");

    const sizeMb = (fs.statSync(targetFile).size / (1024 * 1024)).toFixed(2);
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ [Database Backup] Selesai dalam ${durationSec}s!`);
    console.log(`📁 File: ${targetFile} (${sizeMb} MB)`);
    console.log(`📊 Total Records: ${transactions.length} Transaksi, ${users.length} Users`);

    // Clean up backups older than 14 days
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const maxAgeMs = 14 * 24 * 60 * 60 * 1000;

    for (const f of files) {
      if (f.startsWith("rinci-db-backup-") && f.endsWith(".json")) {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ [Backup Cleanup] Menghapus backup usang: ${f}`);
        }
      }
    }
  } catch (err) {
    console.error("❌ [Database Backup] Gagal:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();

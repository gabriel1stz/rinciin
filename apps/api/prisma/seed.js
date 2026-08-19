import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "Makanan",
        type: "EXPENSE",
        keywords: ["makan", "kopi", "bakso", "ayam", "nasi", "mie"]
      },
      {
        name: "Transport",
        type: "EXPENSE",
        keywords: ["bensin", "grab", "gojek", "tol", "parkir"]
      },
      {
        name: "Belanja",
        type: "EXPENSE",
        keywords: ["beli", "shopping", "tokopedia", "shopee"]
      },
      {
        name: "Gaji",
        type: "INCOME",
        keywords: ["gaji", "salary"]
      },
      {
        name: "Bonus",
        type: "INCOME",
        keywords: ["bonus", "thr"]
      }
    ]
  });

  console.log("✅ Category seeded");

  const existing = await prisma.internalUser.findUnique({ where: { email: "admin@rinciin.local" } });

  if (!existing) {
    const passwordHash = await bcrypt.hash("jeleklau", 12);

    await prisma.internalUser.create({
      data: {
        name: "Super Admin",
        email: "admin@rinciin.local",
        passwordHash,
        role: "SUPER_ADMIN",
      },
    });

    console.log("✅ SUPER_ADMIN seeded (admin@rinciin.local / jeleklau)");
  } else {
    console.log("ℹ️  SUPER_ADMIN already exists, skipping");
  }

  const notifCount = await prisma.internalNotification.count();

  if (notifCount === 0) {
    await prisma.internalNotification.createMany({
      data: [
        { type: "SYSTEM_ERROR", title: "High Memory Usage", message: "Server memory usage exceeded 85%. Consider scaling up." },
        { type: "DATABASE_ERROR", title: "Slow Query Detected", message: "Query on transactions table took 12.3s to complete." },
        { type: "AI_ERROR", title: "AI Response Timeout", message: "OpenAI API returned 503 for 3 consecutive requests." },
        { type: "PAYMENT_ERROR", title: "Failed Payment Retry", message: "Subscription renewal failed for user ID: user_abc123." },
        { type: "FAILED_LOGIN", title: "Suspicious Login Attempt", message: "5 failed login attempts from IP 192.168.1.100 in 10 minutes." },
        { type: "SYSTEM_ERROR", title: "Disk Space Warning", message: "Available disk space is below 10GB on the primary volume." },
        { type: "DATABASE_ERROR", title: "Connection Pool Exhausted", message: "Database connection pool reached maximum capacity." },
        { type: "PAYMENT_ERROR", title: "Refund Failed", message: "Automatic refund for order #ORD-9876 could not be processed." },
      ],
    });

    console.log("✅ Sample notifications seeded");
  } else {
    console.log("ℹ️  Notifications already exist, skipping");
  }
}

main()
  .finally(() => prisma.$disconnect());
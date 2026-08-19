import prisma from "../../../lib/prisma.js";

function getDateRange(period = "today") {
  const start = new Date();
  const end = new Date();

  if (period === "week") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
  }

  if (period === "month") {
    start.setDate(1);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function findTransactionsByPeriod(phone, period = "today") {
  const { start, end } = getDateRange(period);

  return prisma.transaction.findMany({
    where: {
      user: { phone },
      deletedAt: null,
      createdAt: {
        gte: start,
        lte: end
      }
    },
    include: {
      wallet: true,
      category: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function findTransactionsByUserId(userId, startDate) {
  return prisma.transaction.findMany({
    where: {
      userId,
      deletedAt: null,
      OR: [
        { createdAt: { gte: startDate } },
        { date: { gte: startDate } }
      ]
    },
    include: {
      wallet: true,
      category: true
    },
    orderBy: { createdAt: "desc" }
  });
}


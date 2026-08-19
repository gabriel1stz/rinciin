import prisma from "../../../lib/prisma.js";

export async function findBudgets(userId) {
  return prisma.budget.findMany({
    where: { userId, deletedAt: null },
    include: { category: true, wallet: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function findBudgetById(id, includeDeleted = false) {
  const where = { id };
  if (!includeDeleted) where.deletedAt = null;

  return prisma.budget.findFirst({
    where,
    include: { category: true, wallet: true },
  });
}

export async function findBudgetByCategory(userId, categoryId) {
  return prisma.budget.findFirst({
    where: { userId, categoryId, deletedAt: null },
    include: { category: true, wallet: true },
  });
}

export async function createBudget(data) {
  return prisma.budget.create({
    data: {
      userId: data.userId,
      categoryId: data.categoryId,
      walletId: data.walletId || null,
      name: data.name || null,
      amount: data.amount,
      period: data.period || "MONTHLY",
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      carryOver: data.carryOver || false,
      notification: data.notification !== undefined ? data.notification : true,
    },
    include: { category: true, wallet: true },
  });
}

export async function updateBudget(id, data) {
  const updateData = {};
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.walletId !== undefined) updateData.walletId = data.walletId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.period !== undefined) updateData.period = data.period;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.carryOver !== undefined) updateData.carryOver = data.carryOver;
  if (data.notification !== undefined) updateData.notification = data.notification;

  return prisma.budget.update({
    where: { id },
    data: updateData,
    include: { category: true, wallet: true },
  });
}

export async function deleteBudgetById(id) {
  return prisma.budget.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restoreBudgetById(id) {
  return prisma.budget.update({
    where: { id },
    data: { deletedAt: null },
  });
}

export async function aggregateExpensesByCategory(userId, categoryIds, dateFrom, dateTo, walletIdMap) {
  const where = {
    userId,
    type: "EXPENSE",
    deletedAt: null,
    categoryId: { in: categoryIds },
    date: {},
  };

  if (dateFrom) where.date.gte = dateFrom;
  if (dateTo) where.date.lte = dateTo;

  const results = await prisma.transaction.groupBy({
    by: ["categoryId", "walletId"],
    where,
    _sum: { amount: true },
  });

  return results.map((r) => ({
    categoryId: r.categoryId,
    walletId: r.walletId,
    amount: Number(r._sum.amount) || 0,
  }));
}

export async function countActiveBudgets(userId) {
  return prisma.budget.count({
    where: { userId, deletedAt: null },
  });
}

export async function sumBudgetAmounts(userId) {
  const result = await prisma.budget.aggregate({
    where: { userId, deletedAt: null },
    _sum: { amount: true },
  });
  return Number(result._sum.amount) || 0;
}

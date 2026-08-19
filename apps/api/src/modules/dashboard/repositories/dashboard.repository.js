import prisma from "../../../lib/prisma.js";

const ACTIVE_FILTER = { deletedAt: null };

export async function getSummary(userId) {
  const [incomeAgg, expenseAgg, walletAgg, txCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, ...ACTIVE_FILTER, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, ...ACTIVE_FILTER, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.wallet.aggregate({
      where: { userId },
      _sum: { balance: true },
    }),
    prisma.transaction.count({
      where: { userId, ...ACTIVE_FILTER },
    }),
  ]);

  return {
    totalBalance: Number(walletAgg._sum.balance) || 0,
    totalIncome: Number(incomeAgg._sum.amount) || 0,
    totalExpense: Number(expenseAgg._sum.amount) || 0,
    totalTransaction: txCount,
  };
}

export async function getWallets(userId) {
  return prisma.wallet.findMany({
    where: { userId },
    orderBy: { balance: "desc" },
  });
}

export async function getRecentTransactions(userId) {
  return prisma.transaction.findMany({
    where: { userId, ...ACTIVE_FILTER },
    include: { wallet: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function getBudgetOverview(userId) {
  const [budgetCount, budgetSum, expenseAgg] = await Promise.all([
    prisma.budget.count({
      where: { userId, deletedAt: null },
    }),
    prisma.budget.aggregate({
      where: { userId, deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, ...ACTIVE_FILTER, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  const totalBudget = Number(budgetSum._sum.amount) || 0;
  const totalSpent = Number(expenseAgg._sum.amount) || 0;
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  let status = "NO_ACTIVITY";
  if (totalSpent > 0) {
    if (percentage > 100) {
      status = "OVER";
    } else if (percentage >= 90) {
      status = "LIMIT";
    } else if (percentage >= 70) {
      status = "WARNING";
    } else {
      status = "SAFE";
    }
  }

  return {
    totalBudget,
    totalSpent,
    remaining,
    percentage,
    status,
    activeBudgets: budgetCount,
  };
}

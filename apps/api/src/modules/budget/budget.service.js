import { findOrCreateCategory } from "../category/repositories/category.repository.js";
import {
  findBudgets,
  findBudgetById,
  findBudgetByCategory,
  createBudget,
  updateBudget,
  deleteBudgetById,
  restoreBudgetById,
  aggregateExpensesByCategory,
  countActiveBudgets,
  sumBudgetAmounts,
} from "./repositories/budget.repository.js";
import { findWalletById } from "../wallet/repositories/wallet.repository.js";
import {
  calculateCurrentPeriod,
  calculatePreviousPeriod,
  calculateEffectiveBudget,
  calculatePercentage,
  calculateRemaining,
  calculateStatus,
  attachComputedFields,
  isValidPeriod,
  buildSpentQuery,
} from "../../core/budget/budget.engine.js";
import prisma from "../../lib/prisma.js";

const VALID_PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"];

function validateAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("amount harus lebih dari 0");
  }
  return amount;
}

function validatePeriod(period) {
  if (period && !VALID_PERIODS.includes(period)) {
    throw new Error(`period tidak valid. Gunakan: ${VALID_PERIODS.join(", ")}`);
  }
}

function validateDates(startDate, endDate) {
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("startDate harus sebelum endDate");
  }
}

async function resolveCategory(userId, categoryName) {
  if (!categoryName) throw new Error("categoryName wajib diisi");
  const category = await findOrCreateCategory(categoryName, "EXPENSE");
  if (!category) throw new Error("Kategori tidak ditemukan");
  return category;
}

async function resolveWallet(userId, walletId) {
  if (!walletId) return null;
  const wallet = await findWalletById(walletId);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  if (wallet.userId !== userId) throw new Error("Wallet bukan milik user ini");
  if (wallet.archived) throw new Error("Wallet sudah diarsipkan");
  return wallet;
}

async function getSpentForBudget(userId, budget) {
  const range = calculateCurrentPeriod(budget.period, budget.startDate, budget.endDate);
  const where = buildSpentQuery(userId, budget, range);

  const result = await prisma.transaction.aggregate({
    where,
    _sum: { amount: true },
  });

  return Number(result._sum.amount) || 0;
}

async function getBatchSpent(budgets, userId) {
  const budgetsWithRange = budgets.map((b) => ({
    budget: b,
    range: calculateCurrentPeriod(b.period, b.startDate, b.endDate),
  }));

  const minDate = budgetsWithRange.reduce(
    (min, br) => (!min || br.range.start < min ? br.range.start : min),
    null,
  );
  const maxDate = budgetsWithRange.reduce(
    (max, br) => (!max || (br.range.end && br.range.end > max) ? br.range.end : max),
    null,
  );

  const categoryIds = [...new Set(budgets.map((b) => b.categoryId))];
  const rawRows = await aggregateExpensesByCategory(userId, categoryIds, minDate, maxDate);

  const spentByBudget = [];

  for (const { budget, range } of budgetsWithRange) {
    let spent = 0;

    for (const row of rawRows) {
      if (row.categoryId !== budget.categoryId) continue;
      if (budget.walletId && row.walletId !== budget.walletId) continue;
      spent += row.amount;
    }

    spentByBudget.push({ budget, spent, range });
  }

  return spentByBudget;
}

async function computeCarryOver(userId, budget) {
  if (!budget.carryOver) return 0;

  const prevRange = calculatePreviousPeriod(budget.period, budget.startDate, budget.endDate);

  const where = buildSpentQuery(userId, budget, prevRange);
  const result = await prisma.transaction.aggregate({
    where,
    _sum: { amount: true },
  });

  const prevSpent = Number(result._sum.amount) || 0;
  const prevRemaining = Number(budget.amount) - prevSpent;
  return Math.max(0, prevRemaining);
}

async function enrichBudget(userId, budget) {
  const range = calculateCurrentPeriod(budget.period, budget.startDate, budget.endDate);
  const spent = await getSpentForBudget(userId, budget);
  const carryOver = await computeCarryOver(userId, budget);
  const effectiveBudget = calculateEffectiveBudget(budget.amount, carryOver);

  return attachComputedFields(budget, spent, effectiveBudget, carryOver);
}

export async function listBudgets(userId) {
  const budgets = await findBudgets(userId);
  if (budgets.length === 0) return [];

  const spentData = await getBatchSpent(budgets, userId);
  const results = [];

  for (const { budget, spent } of spentData) {
    const carryOver = await computeCarryOver(userId, budget);
    const effectiveBudget = calculateEffectiveBudget(budget.amount, carryOver);
    results.push(attachComputedFields(budget, spent, effectiveBudget, carryOver));
  }

  return results;
}

export async function getBudgetById(userId, id) {
  const budget = await findBudgetById(id);
  if (!budget || budget.deletedAt) throw new Error("Budget tidak ditemukan");
  if (budget.userId !== userId) throw new Error("Unauthorized");

  return enrichBudget(userId, budget);
}

export async function createBudgetRest(userId, data, auditFn) {
  const category = await resolveCategory(userId, data.categoryName || data.name);
  const amount = validateAmount(data.amount);
  if (data.period) validatePeriod(data.period);
  validateDates(data.startDate, data.endDate);
  if (data.walletId) await resolveWallet(userId, data.walletId);

  const existing = await findBudgetByCategory(userId, category.id);
  if (existing) throw new Error("Budget untuk kategori ini sudah ada");

  const budget = await createBudget({
    userId,
    categoryId: category.id,
    walletId: data.walletId || null,
    name: data.name || category.name,
    amount,
    period: data.period || "MONTHLY",
    startDate: data.startDate || undefined,
    endDate: data.endDate || null,
    carryOver: data.carryOver || false,
    notification: data.notification,
  });

  const enriched = await enrichBudget(userId, budget);

  if (auditFn) {
    await auditFn({
      action: "CREATE_BUDGET",
      entityType: "Budget",
      entityId: budget.id,
      after: {
        amount: enriched.effectiveBudget,
        period: enriched.period,
        categoryId: enriched.categoryId,
        carryOver: enriched.carryOver,
        notification: enriched.notification,
        remaining: enriched.remaining,
        status: enriched.status,
      },
    });
  }

  return enriched;
}

export async function updateBudgetRest(userId, id, data, auditFn) {
  const budget = await findBudgetById(id);
  if (!budget || budget.deletedAt) throw new Error("Budget tidak ditemukan");
  if (budget.userId !== userId) throw new Error("Unauthorized");

  if (data.amount !== undefined) validateAmount(data.amount);
  if (data.period) validatePeriod(data.period);
  validateDates(data.startDate || budget.startDate, data.endDate || budget.endDate);
  if (data.walletId !== undefined) await resolveWallet(userId, data.walletId);

  const updated = await updateBudget(id, data);
  const enriched = await enrichBudget(userId, updated);

  if (auditFn) {
    await auditFn({
      action: "UPDATE_BUDGET",
      entityType: "Budget",
      entityId: id,
      before: { amount: Number(budget.amount), period: budget.period, carryOver: budget.carryOver, notification: budget.notification },
      after: {
        amount: Number(updated.amount),
        period: updated.period,
        carryOver: updated.carryOver,
        notification: updated.notification,
        effectiveBudget: enriched.effectiveBudget,
        remaining: enriched.remaining,
        status: enriched.status,
      },
    });
  }

  return enriched;
}

export async function deleteBudgetRest(userId, id, auditFn) {
  const budget = await findBudgetById(id);
  if (!budget || budget.deletedAt) throw new Error("Budget tidak ditemukan");
  if (budget.userId !== userId) throw new Error("Unauthorized");

  await deleteBudgetById(id);

  if (auditFn) {
    await auditFn({
      action: "DELETE_BUDGET",
      entityType: "Budget",
      entityId: id,
      before: {
        amount: Number(budget.amount),
        period: budget.period,
        carryOver: budget.carryOver,
        notification: budget.notification,
      },
      metadata: { deletedAt: new Date().toISOString() },
    });
  }

  return budget;
}

export async function restoreBudgetRest(userId, id, auditFn) {
  const budget = await findBudgetById(id, true);
  if (!budget) throw new Error("Budget tidak ditemukan");
  if (budget.userId !== userId) throw new Error("Unauthorized");
  if (!budget.deletedAt) throw new Error("Budget tidak dalam status terhapus");

  const restored = await restoreBudgetById(id);
  const enriched = await enrichBudget(userId, restored);

  if (auditFn) {
    await auditFn({
      action: "RESTORE_BUDGET",
      entityType: "Budget",
      entityId: id,
      before: { deletedAt: budget.deletedAt },
      after: { deletedAt: null },
    });
  }

  return enriched;
}

export async function getBudgetSummary(userId) {
  const budgets = await findBudgets(userId);
  if (budgets.length === 0) {
    return {
      totalBudget: 0, totalSpent: 0, remaining: 0, percentage: 0, status: "NO_ACTIVITY", activeBudgets: 0,
    };
  }

  const spentData = await getBatchSpent(budgets, userId);

  let totalBudget = 0;
  let totalSpent = 0;

  for (const { budget, spent } of spentData) {
    totalBudget += Number(budget.amount);
    totalSpent += spent;
  }

  const remaining = calculateRemaining(totalBudget, totalSpent);
  const percentage = calculatePercentage(totalBudget, totalSpent);
  const status = calculateStatus(totalSpent, totalBudget);

  return {
    totalBudget,
    totalSpent,
    remaining,
    percentage,
    status,
    activeBudgets: budgets.length,
  };
}

export async function getBudgetStatusCount(userId) {
  const budgets = await findBudgets(userId);
  if (budgets.length === 0) return {};

  const spentData = await getBatchSpent(budgets, userId);
  const counts = {};

  for (const { budget, spent } of spentData) {
    const effectiveBudget = calculateEffectiveBudget(budget.amount, 0);
    const status = calculateStatus(spent, effectiveBudget);
    counts[status] = (counts[status] || 0) + 1;
  }

  for (const s of ["NO_ACTIVITY", "SAFE", "WARNING", "LIMIT", "OVER"]) {
    if (!counts[s]) counts[s] = 0;
  }

  return counts;
}

export async function saveBudget(userId, data) {
  const category = await resolveCategory(userId, data.categoryName);
  if (!category) throw new Error("Kategori tidak ditemukan");

  const existing = await findBudgetByCategory(userId, category.id);
  if (existing) {
    const updated = await updateBudget(existing.id, {
      amount: data.amount,
      period: "MONTHLY",
    });
    return enrichBudget(userId, updated);
  }

  const budget = await createBudget({
    userId,
    categoryId: category.id,
    name: category.name,
    amount: data.amount,
    period: data.period === "month" ? "MONTHLY" : (data.period || "MONTHLY"),
    startDate: new Date(),
  });

  return enrichBudget(userId, budget);
}

export async function getBudgets(userId) {
  return listBudgets(userId);
}

export async function checkBudget(userId, categoryName) {
  if (!categoryName) return null;

  const category = await findOrCreateCategory(categoryName, "EXPENSE");
  if (!category) return null;

  const budget = await findBudgetByCategory(userId, category.id);
  if (!budget) return null;

  const spent = await getSpentForBudget(userId, budget);
  const effectiveBudget = calculateEffectiveBudget(budget.amount, 0);
  const remaining = calculateRemaining(effectiveBudget, spent);
  const percentage = calculatePercentage(effectiveBudget, spent);
  const status = calculateStatus(spent, effectiveBudget);

  return {
    budget: Number(budget.amount),
    spent,
    remaining,
    percentage,
    status,
  };
}

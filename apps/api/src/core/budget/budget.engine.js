/**
 * BudgetEngine — pure computation, no Prisma, no side effects.
 *
 * Responsibilities:
 * - Period range calculation (current + previous)
 * - Status classification
 * - Percentage, remaining, effective budget
 * - Batch spent calculation from raw transaction data
 */

const VALID_PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"];

export function isValidPeriod(period) {
  return VALID_PERIODS.includes(period);
}

export function calculateCurrentPeriod(period, startDate, endDate) {
  const now = new Date();

  if (period === "DAILY") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "WEEKLY") {
    const start = new Date(now);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "MONTHLY") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (period === "YEARLY") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  if (period === "CUSTOM") {
    const s = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const e = endDate ? new Date(endDate) : null;
    return { start: s, end: e };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function calculatePreviousPeriod(period, startDate, endDate) {
  const current = calculateCurrentPeriod(period, startDate, endDate);
  const duration = current.end
    ? current.end.getTime() - current.start.getTime()
    : 30 * 24 * 60 * 60 * 1000;

  const prevEnd = new Date(current.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);

  return { start: prevStart, end: prevEnd };
}

export function calculatePercentage(effectiveBudget, spent) {
  if (effectiveBudget <= 0) return 0;
  return Math.round((spent / effectiveBudget) * 100);
}

export function calculateRemaining(effectiveBudget, spent) {
  return Math.max(0, effectiveBudget - spent);
}

export function calculateStatus(spent, effectiveBudget) {
  if (spent === 0) return "NO_ACTIVITY";
  if (effectiveBudget <= 0) return "OVER";
  const pct = (spent / effectiveBudget) * 100;
  if (pct > 100) return "OVER";
  if (pct >= 90) return "LIMIT";
  if (pct >= 70) return "WARNING";
  return "SAFE";
}

export function calculateEffectiveBudget(amount, carryOverAmount = 0) {
  return Number(amount) + carryOverAmount;
}

export function attachComputedFields(budget, spent, effectiveBudget, carryOver = 0) {
  const percentage = calculatePercentage(effectiveBudget, spent);
  return {
    ...budget,
    spent,
    remaining: calculateRemaining(effectiveBudget, spent),
    percentage,
    status: calculateStatus(spent, effectiveBudget),
    effectiveBudget,
    carryOverAmount: carryOver,
  };
}

export function buildSpentQuery(userId, budget, periodRange) {
  const where = {
    userId,
    categoryId: budget.categoryId,
    type: "EXPENSE",
    deletedAt: null,
    date: { gte: periodRange.start },
  };

  if (budget.walletId) {
    where.walletId = budget.walletId;
  }

  if (periodRange.end) {
    where.date.lte = periodRange.end;
  }

  return where;
}

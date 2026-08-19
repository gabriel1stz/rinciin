import { calculateStatus } from "./budget.engine.js";

const STATUS_TO_NOTIFICATION = {
  NO_ACTIVITY: "NONE",
  SAFE: "NONE",
  WARNING: "WARNING",
  LIMIT: "LIMIT",
  OVER: "OVER",
};

export function checkBudgetNotification(budget) {
  if (!budget || !budget.notification) return "NONE";

  const status = budget.status || calculateStatus(budget.spent || 0, budget.effectiveBudget || budget.amount || 0);

  return STATUS_TO_NOTIFICATION[status] || "NONE";
}

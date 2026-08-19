import {
  getSummary,
  getWallets,
  getRecentTransactions,
  getBudgetOverview,
} from "./repositories/dashboard.repository.js";
import { getBudgetStatusCount } from "../budget/budget.service.js";

export async function getDashboard(userId) {
  const [summary, wallets, transactions, budget, budgetStatusCount] = await Promise.all([
    getSummary(userId),
    getWallets(userId),
    getRecentTransactions(userId),
    getBudgetOverview(userId),
    getBudgetStatusCount(userId),
  ]);

  return {
    totalBalance: summary.totalBalance,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    totalTransaction: summary.totalTransaction,
    wallets,
    recentTransactions: transactions,
    budget: budget
      ? {
          percentage: budget.percentage,
          remaining: budget.remaining,
          totalBudget: budget.totalBudget,
          totalSpent: budget.totalSpent,
          status: budget.status,
          activeBudgets: budget.activeBudgets,
        }
      : {
          percentage: 0,
          remaining: 0,
          totalBudget: 0,
          totalSpent: 0,
          status: "NO_ACTIVITY",
          activeBudgets: 0,
        },
    budgetStatusCount,
  };
}
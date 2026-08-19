// dashboard.ts
import { Wallet } from './wallet';
import { Transaction } from './transaction';

export interface BudgetOverview {
  percentage: number;
  remaining: number;
  totalBudget: number;
  totalSpent: number;
  status: string;
  activeBudgets: number;
}

export interface BudgetStatusCount {
  safe: number;
  warning: number;
  danger: number;
  exceeded: number;
}

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTransaction: number;
  wallets: Wallet[];
  recentTransactions: Transaction[];
  budget: BudgetOverview;
  budgetStatusCount?: BudgetStatusCount;
}

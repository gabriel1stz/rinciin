// budget.ts
import { Category } from './category';
import { Wallet } from './wallet';

export type BudgetStatus = 'SAFE' | 'WARNING' | 'DANGER' | 'EXCEEDED' | 'NO_ACTIVITY';
export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  walletId: string | null;
  name: string | null;
  amount: number | string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  carryOver: boolean;
  notification: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category?: Category;
  wallet?: Wallet | null;
  // Computed / Enriched fields from backend
  spent?: number;
  effectiveBudget?: number;
  remaining?: number;
  percentage?: number;
  status?: BudgetStatus;
}

export interface CreateBudgetPayload {
  categoryName: string;
  name?: string;
  amount: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  walletId?: string;
  carryOver?: boolean;
  notification?: boolean;
}

export interface UpdateBudgetPayload {
  name?: string;
  amount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  walletId?: string;
  carryOver?: boolean;
  notification?: boolean;
}

// transaction.ts
import { Category } from './category';
import { Wallet } from './wallet';
import { Pagination } from './api';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  transactionCode: string;
  userId: string;
  walletId: string;
  categoryId: string;
  type: TransactionType;
  amount: number | string;
  description: string | null;
  note: string | null;
  subCategory: string | null;
  rawText: string | null;
  receiptUrl: string | null;
  tags: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  wallet?: Wallet;
  category?: Category;
}

export interface TransactionListResult {
  data: Transaction[];
  pagination: Pagination;
}

export interface CreateTransactionPayload {
  walletName: string;
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  note?: string;
  date?: string;
  receiptUrl?: string;
  tags?: string[];
}

export interface UpdateTransactionPayload {
  walletId?: string;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE';
  amount?: number;
  description?: string;
  note?: string;
  date?: string;
  receiptUrl?: string;
  tags?: string[];
}

export interface TransactionFilter {
  search?: string;
  type?: 'INCOME' | 'EXPENSE' | '';
  walletId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sort?: 'date' | 'amount' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

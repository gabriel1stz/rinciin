// transaction.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import {
  Transaction,
  TransactionListResult,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionFilter,
} from '../types/transaction';

export const transactionService = {
  getTransactions: async (filters?: TransactionFilter): Promise<TransactionListResult> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.walletId) params.append('walletId', filters.walletId);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.minAmount) params.append('minAmount', String(filters.minAmount));
    if (filters?.maxAmount) params.append('maxAmount', String(filters.maxAmount));
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const res = await api.get<ApiResponse<TransactionListResult>>(`/transactions?${params.toString()}`);
    return res.data.data;
  },

  getTransactionDetail: async (id: string): Promise<Transaction> => {
    const res = await api.get<ApiResponse<Transaction>>(`/transactions/detail/${id}`);
    return res.data.data;
  },

  createTransaction: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const res = await api.post<ApiResponse<Transaction>>('/transactions', payload);
    return res.data.data;
  },

  updateTransaction: async (id: string, payload: UpdateTransactionPayload): Promise<Transaction> => {
    const res = await api.patch<ApiResponse<Transaction>>(`/transactions/${id}`, payload);
    return res.data.data;
  },

  deleteTransaction: async (id: string): Promise<Transaction> => {
    const res = await api.delete<ApiResponse<Transaction>>(`/transactions/${id}`);
    return res.data.data;
  },

  restoreTransaction: async (id: string): Promise<Transaction> => {
    const res = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/restore`);
    return res.data.data;
  },

  uploadReceipt: async (id: string, file: File): Promise<Transaction> => {
    const formData = new FormData();
    formData.append('receipt', file);
    const res = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

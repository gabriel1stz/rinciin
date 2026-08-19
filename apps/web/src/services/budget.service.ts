// budget.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import { Budget, CreateBudgetPayload, UpdateBudgetPayload } from '../types/budget';

export const budgetService = {
  getBudgets: async (): Promise<Budget[]> => {
    const res = await api.get<ApiResponse<Budget[]>>('/budgets');
    return res.data.data;
  },

  getBudgetDetail: async (id: string): Promise<Budget> => {
    const res = await api.get<ApiResponse<Budget>>(`/budgets/${id}`);
    return res.data.data;
  },

  createBudget: async (payload: CreateBudgetPayload): Promise<Budget> => {
    const res = await api.post<ApiResponse<Budget>>('/budgets', payload);
    return res.data.data;
  },

  updateBudget: async (id: string, payload: UpdateBudgetPayload): Promise<Budget> => {
    const res = await api.patch<ApiResponse<Budget>>(`/budgets/${id}`, payload);
    return res.data.data;
  },

  deleteBudget: async (id: string): Promise<Budget> => {
    const res = await api.delete<ApiResponse<Budget>>(`/budgets/${id}`);
    return res.data.data;
  },

  restoreBudget: async (id: string): Promise<Budget> => {
    const res = await api.post<ApiResponse<Budget>>(`/budgets/${id}/restore`);
    return res.data.data;
  },
};

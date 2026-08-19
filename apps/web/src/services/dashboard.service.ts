// dashboard.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import { DashboardData } from '../types/dashboard';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await api.get<ApiResponse<DashboardData>>('/dashboard');
    return res.data.data;
  },
};

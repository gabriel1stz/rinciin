// services/admin.service.ts
import axios from 'axios';
import { ApiResponse } from '../types/api';

const BASE_URL = '/api';

const adminStorage = {
  getToken: () => localStorage.getItem('rinci_admin_token'),
  setToken: (token: string) => localStorage.setItem('rinci_admin_token', token),
  clearToken: () => localStorage.removeItem('rinci_admin_token'),
  getAdmin: () => {
    const raw = localStorage.getItem('rinci_admin_user');
    return raw ? JSON.parse(raw) : null;
  },
  setAdmin: (admin: any) => localStorage.setItem('rinci_admin_user', JSON.stringify(admin)),
  clearAdmin: () => localStorage.removeItem('rinci_admin_user'),
};

const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use((config) => {
  const token = adminStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/admin/login')) {
      adminStorage.clearToken();
      adminStorage.clearAdmin();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);


export interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'down';
  uptime: {
    seconds: number;
    formatted: string;
    serverStartedAt: string;
  };
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
    cpuModel: string;
    cpuCores: number;
    eventLoopLagMs: number;
  };
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    systemFreeMb: number;
    systemTotalMb: number;
    memoryUsagePercent: number;
  };
  services: Array<{
    name: string;
    status: string;
    latencyMs: number;
    required: boolean;
  }>;
  database: {
    status: string;
    latencyMs: number;
    error: string | null;
    connectionPool: string;
    provider: string;
  };
  records?: {
    users: number;
    transactions: number;
    aiConversations: number;
    auditLogs: number;
  };
  unresolvedErrors?: number;
  timestamp: string;
}

export interface SecurityMetricsData {
  score: number;
  grade: string;
  status: string;
  tokens: {
    activeRefreshTokens: number;
    revokedRefreshTokens: number;
    internalAdmins: number;
  };
  rateLimiter: {
    total429Blocked: number;
    recentTriggers: Array<{
      id: string;
      type: string;
      ip: string;
      key: string;
      path: string;
      timestamp: string;
    }>;
  };
  failedLogins: Array<{
    id: string;
    title: string;
    message: string;
    timestamp: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    userId: string;
    entityType: string;
    entityId: string;
    createdAt: string;
  }>;
  securityChecklist: Array<{
    name: string;
    active: boolean;
    level: string;
  }>;
}

export interface SlaMetricsData {
  slaTarget: number;
  currentAvailability: number;
  status: 'SLA_MET' | 'AT_RISK';
  uptimeSeconds: number;
  errorRate: string;
  errorBudgetPercent: number;
  latency: {
    avgMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    targetMs: number;
  };
  requestsBreakdown: {
    total: number;
    success2xx: number;
    redirect3xx: number;
    clientError4xx: number;
    serverError5xx: number;
    rateLimited429: number;
  };
  incidents: Array<{
    id: string;
    service: string;
    status: string;
    impact: string;
    description: string;
    timestamp: string;
  }>;
}

export interface UsageMetricsData {
  throughput: {
    currentRpm: number;
    peakRpm: number;
    totalRequestsToday: number;
    rpmTimeline: Array<{
      timestamp: number;
      time: string;
      requests: number;
    }>;
  };
  endpoints: Record<string, number>;
  aiUsage: {
    totalConversations: number;
    estimatedTokensProcessed: number;
    avgResponseSpeedMs: number;
    geminiModel: string;
  };
  databaseUsage: {
    users: number;
    premiumUsers: number;
    transactions: number;
    wallets: number;
    budgets: number;
    aiLogs: number;
    estimatedDbSizeMb: number;
  };
}

export interface MonitoringSummaryData {
  timestamp: string;
  health: SystemHealthData;
  security: SecurityMetricsData;
  sla: SlaMetricsData;
  usage: UsageMetricsData;
}

export const adminService = {
  storage: adminStorage,

  login: async (email: string, password: string) => {
    const response = await adminApi.post<ApiResponse<{ user: any; accessToken: string }>>(
      '/internal-auth/login',
      { email, password }
    );
    const data = response.data.data;
    adminStorage.setToken(data.accessToken);
    adminStorage.setAdmin(data.user);
    return data;
  },

  logout: () => {
    adminStorage.clearToken();
    adminStorage.clearAdmin();
  },

  getMe: async () => {
    const response = await adminApi.get<ApiResponse<any>>('/internal-auth/me');
    return response.data.data;
  },

  getDashboard: async () => {
    const response = await adminApi.get<ApiResponse<any>>('/internal/dashboard');
    return response.data.data;
  },

  getUsers: async (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
    const response = await adminApi.get<ApiResponse<any>>('/internal/users', { params });
    return response.data.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await adminApi.put<ApiResponse<any>>(`/internal/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: string) => {
    const response = await adminApi.delete<ApiResponse<any>>(`/internal/users/${id}`);
    return response.data.data;
  },

  getSystemHealth: async () => {
    const response = await adminApi.get<ApiResponse<SystemHealthData>>('/internal/system-health');
    return response.data.data;
  },

  getSecurityMetrics: async () => {
    const response = await adminApi.get<ApiResponse<SecurityMetricsData>>('/internal/security-metrics');
    return response.data.data;
  },

  getSlaMetrics: async () => {
    const response = await adminApi.get<ApiResponse<SlaMetricsData>>('/internal/sla-metrics');
    return response.data.data;
  },

  getUsageMetrics: async () => {
    const response = await adminApi.get<ApiResponse<UsageMetricsData>>('/internal/usage-metrics');
    return response.data.data;
  },

  getMonitoringSummary: async () => {
    const response = await adminApi.get<ApiResponse<MonitoringSummaryData>>('/internal/monitoring-summary');
    return response.data.data;
  },

  getActiveSessions: async (limit = 50) => {
    const response = await adminApi.get<ApiResponse<any>>('/internal/active-sessions', {
      params: { limit },
    });
    return response.data.data;
  },

  revokeSession: async (id: string) => {
    const response = await adminApi.delete<ApiResponse<any>>(`/internal/active-sessions/${id}`);
    return response.data.data;
  },

  cleanupExpiredSessions: async () => {
    const response = await adminApi.post<ApiResponse<{ success: boolean; message: string; cleanedCount: number }>>(
      '/internal/maintenance/cleanup-sessions'
    );
    return response.data.data;
  },

  sendBroadcast: async (data: { message: string; targetTier: string; delaySeconds: number }) => {
    const response = await adminApi.post<ApiResponse<{ success: boolean; message: string; totalTarget: number }>>(
      '/internal/broadcast',
      data
    );
    return response.data.data;
  },

  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    const response = await adminApi.get<ApiResponse<any>>('/internal/audit-logs', { params });
    return response.data.data;
  },

  getAiConversations: async (params?: { page?: number; limit?: number }) => {
    const response = await adminApi.get<ApiResponse<any>>('/internal/ai-conversations', { params });
    return response.data.data;
  },

  exportUsersCsv: async () => {
    const response = await adminApi.get('/internal/export/users?format=csv', {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rinci-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  exportUsersCsvUrl: () => `${BASE_URL}/internal/export/users?format=csv`,
};

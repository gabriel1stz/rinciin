// auth.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import { AuthResult, SendOtpResult, Session, UpdateProfilePayload, User } from '../types/auth';

export const authService = {
  sendOtp: async (phone: string): Promise<SendOtpResult> => {
    const res = await api.post<ApiResponse<SendOtpResult>>('/auth/send-otp', { phone });
    return res.data.data;
  },

  verifyOtp: async (phone: string, otp: string): Promise<AuthResult> => {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/verify', { phone, otp });
    return res.data.data;
  },

  googleLogin: async (idToken: string): Promise<AuthResult> => {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/google', { idToken });
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const res = await api.put<ApiResponse<User>>('/auth/me', payload);
    return res.data.data;
  },

  getSessions: async (): Promise<Session[]> => {
    const res = await api.get<ApiResponse<Session[]>>('/auth/sessions');
    return res.data.data;
  },

  revokeSession: async (id: string): Promise<void> => {
    await api.delete(`/auth/sessions/${id}`);
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  sessionFromOrderId: async (orderId: string): Promise<AuthResult> => {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/session-from-order', { orderId });
    return res.data.data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/auth/account');
  },
};


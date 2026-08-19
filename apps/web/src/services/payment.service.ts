// services/payment.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import { Plan, PaymentInvoice, CreatePaymentPayload } from '../types/payment';

export const paymentService = {
  // Fetch available plans from backend
  getPlans: async (): Promise<Plan[]> => {
    try {
      const response = await api.get<ApiResponse<Plan[]>>('/payments/plans');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  // Create Pakasir payment invoice
  createPayment: async (payload: CreatePaymentPayload): Promise<PaymentInvoice> => {
    const response = await api.post<ApiResponse<PaymentInvoice>>('/payments/create', payload);
    return response.data.data;
  },

  // Check payment status by orderId
  getPaymentStatus: async (orderId: string): Promise<PaymentInvoice> => {
    const response = await api.get<ApiResponse<PaymentInvoice>>(`/payments/status/${orderId}`);
    return response.data.data;
  },

  // Cancel payment transaction
  cancelPayment: async (orderId: string): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/payments/cancel/${orderId}`);
    return response.data.data;
  },

  // Simulate payment success (Sandbox / Dev mode)
  simulatePayment: async (orderId: string): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/payments/simulate/${orderId}`);
    return response.data.data;
  },

  // Activate Trial / Free subscription directly
  activateTrial: async (phone: string): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/subscriptions/activate', {
      phone,
      plan: 'TRIAL',
    });
    return response.data.data;
  },
};

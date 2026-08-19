// wallet.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import {
  Wallet,
  WalletListResult,
  CreateWalletPayload,
  UpdateWalletPayload,
  TransferWalletPayload,
  WalletFilter,
} from '../types/wallet';

export const walletService = {
  getWallets: async (filters?: WalletFilter): Promise<WalletListResult> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.includeArchived !== undefined) {
      params.append('includeArchived', String(filters.includeArchived));
    }

    const res = await api.get<ApiResponse<WalletListResult>>(`/wallets?${params.toString()}`);
    return res.data.data;
  },

  getWalletDetail: async (id: string): Promise<Wallet> => {
    const res = await api.get<ApiResponse<Wallet>>(`/wallets/detail/${id}`);
    return res.data.data;
  },

  createWallet: async (payload: CreateWalletPayload): Promise<Wallet> => {
    const res = await api.post<ApiResponse<Wallet>>('/wallets', payload);
    return res.data.data;
  },

  updateWallet: async (id: string, payload: UpdateWalletPayload): Promise<Wallet> => {
    const res = await api.patch<ApiResponse<Wallet>>(`/wallets/${id}`, payload);
    return res.data.data;
  },

  deleteWallet: async (id: string): Promise<void> => {
    await api.delete(`/wallets/${id}`);
  },

  transfer: async (payload: TransferWalletPayload): Promise<any> => {
    const res = await api.post<ApiResponse<any>>('/wallets/transfer', payload);
    return res.data.data;
  },

  archiveWallet: async (id: string): Promise<Wallet> => {
    const res = await api.post<ApiResponse<Wallet>>(`/wallets/${id}/archive`);
    return res.data.data;
  },

  restoreWallet: async (id: string): Promise<Wallet> => {
    const res = await api.post<ApiResponse<Wallet>>(`/wallets/${id}/restore`);
    return res.data.data;
  },
};

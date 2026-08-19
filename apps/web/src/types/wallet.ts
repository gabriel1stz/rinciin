// wallet.ts
export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment' | 'other';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  balance: number | string;
  icon: string | null;
  color: string | null;
  type: WalletType | string;
  isDefault: boolean;
  archived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletListResult {
  wallets: Wallet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateWalletPayload {
  name: string;
  type?: string;
  balance?: number;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface UpdateWalletPayload {
  name?: string;
  type?: string;
  balance?: number;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface TransferWalletPayload {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
  date?: string;
}

export interface WalletFilter {
  search?: string;
  sortBy?: 'name' | 'balance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeArchived?: boolean;
}

// auth.ts
export interface UserSubscription {
  id: string;
  plan: string;
  status: string;
  expiresAt: string;
  startsAt?: string;
  amount?: number;
}

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  currency: string;
  tier: string;
  googleId?: string | null;
  subscription?: UserSubscription[];
  wallets?: Array<{ id: string; name: string; balance: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SendOtpResult {
  phone: string;
  expiresIn: number;
  devOtp?: string;
}

export interface Session {
  id: string;
  userId: string;
  device: string | null;
  userAgent: string | null;
  ip: string | null;
  expiresAt: string;
  createdAt: string;
  revoked: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  currency?: string;
  avatar?: string;
}

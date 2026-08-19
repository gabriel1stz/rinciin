// types/payment.ts
export type PlanTier = 'trial' | 'pro' | 'family' | 'free' | 'personal' | 'premium' | 'business';

export interface Plan {
  id: 'trial' | 'pro' | 'family';
  name: string;
  price: number;
  period: string;
  label: string;
  highlight?: string | boolean;
  features: string[];
  ctaText: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

export interface PaymentInvoice {
  id?: string;
  orderId: string;
  phone: string;
  plan: string;
  amount: number;
  status: PaymentStatus;
  paymentUrl?: string;
  method?: string;
  fee?: number;
  totalPayment?: number;
  paymentNumber?: string;
  expiredAt?: string | null;
  paidAt?: string | null;
  createdAt?: string;
}

export interface CreatePaymentPayload {
  phone: string;
  plan: string;
  amount?: number;
  durationDays?: number;
  method?: string;
}

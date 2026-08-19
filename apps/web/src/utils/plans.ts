// utils/plans.ts
// Single source of truth for 3 core plans (Free Trial, Pro, Family) with 1m, 6m, 1y durations & discounts

export type BillingDuration = '1m' | '6m' | '1y';

export interface PlanPricing {
  id: 'trial' | 'pro' | 'family';
  name: string;
  label: string;
  highlight?: string | boolean;
  basePriceMonthly: number;
  features: string[];
  ctaText: string;
}

export const PLANS_CATALOG: PlanPricing[] = [
  {
    id: 'trial',
    name: 'Trial 7 Hari',
    label: 'Coba gratis langsung di WhatsApp bot selama 7 hari',
    highlight: false,
    basePriceMonthly: 0,
    features: [
      'Akses penuh 7 Hari gratis',
      'Catat transaksi via WhatsApp bot',
      'Kelola dompet (Bank, E-Wallet, Cash)',
      'Budget & target keuangan',
      'Laporan dasar & visual chart',
      'Akses asisten Rinci AI',
    ],
    ctaText: 'Mulai Trial di WhatsApp',
  },

  {
    id: 'pro',
    name: 'Pro',
    label: 'Paling diminati untuk kelola finansial pribadi komprehensif',
    highlight: 'Paling Populer',
    basePriceMonthly: 1000,
    features: [
      'Semua fitur Free Trial',
      'Unlimited dompet (Bank, E-Wallet, Cash)',
      'Asisten Rinci AI penuh & insight belanja harian',
      'Scan & OCR foto struk belanja',
      'Input transaksi via Voice Note',
      'Advanced Reports & analisis tren',
      'Budget alert overspending realtime',
      'Ekspor data lengkap (CSV & JSON)',
      'Riwayat transaksi tanpa batas',
    ],
    ctaText: 'Upgrade ke Pro',
  },
  {
    id: 'family',
    name: 'Family',
    label: 'Cocok untuk keluarga yang mau kelola keuangan bareng',
    highlight: false,
    basePriceMonthly: 59000,
    features: [
      'Semua fitur Pro',
      'Hingga 5 anggota keluarga (multi-user)',
      'Shared budget & shared wallet bersama',
      'Ringkasan arus kas keluarga terpadu',
      'Laporan gabungan & individual per anggota',
      'Akses Rinci AI untuk seluruh keluarga',
      'Cukup 1 pembayaran untuk semua',
    ],
    ctaText: 'Pilih Family',
  },
];

export function calculatePlanPrice(
  plan: PlanPricing,
  duration: BillingDuration
): {
  monthlyPrice: number;
  totalPrice: number;
  originalMonthlyPrice?: number;
  discountPct?: number;
  months: number;
  periodLabel: string;
} {
  if (plan.basePriceMonthly === 0) {
    return {
      monthlyPrice: 0,
      totalPrice: 0,
      months: 1,
      periodLabel: '7 Hari',
    };
  }


  switch (duration) {
    case '6m': {
      const discountPct = 20; // Hemat 20%
      const discountedMonthly = Math.round((plan.basePriceMonthly * (100 - discountPct)) / 100);
      return {
        monthlyPrice: discountedMonthly,
        totalPrice: discountedMonthly * 6,
        originalMonthlyPrice: plan.basePriceMonthly,
        discountPct,
        months: 6,
        periodLabel: 'Bulan (Total 6 Bulan)',
      };
    }
    case '1y': {
      const discountPct = 35; // Hemat 35%
      const discountedMonthly = Math.round((plan.basePriceMonthly * (100 - discountPct)) / 100);
      return {
        monthlyPrice: discountedMonthly,
        totalPrice: discountedMonthly * 12,
        originalMonthlyPrice: plan.basePriceMonthly,
        discountPct,
        months: 12,
        periodLabel: 'Bulan (Total 1 Tahun)',
      };
    }
    case '1m':
    default:
      return {
        monthlyPrice: plan.basePriceMonthly,
        totalPrice: plan.basePriceMonthly,
        months: 1,
        periodLabel: 'Bulan',
      };
  }
}

export function getPlanById(planId?: string | null): PlanPricing {
  const normalized = String(planId || 'pro').toLowerCase();
  return (
    PLANS_CATALOG.find((p) => p.id === normalized) ||
    PLANS_CATALOG.find((p) => p.id === 'pro')!
  );
}

export function formatPlanDuration(duration: BillingDuration): string {
  switch (duration) {
    case '6m':
      return '6 Bulan';
    case '1y':
      return '1 Tahun';
    case '1m':
    default:
      return '1 Bulan';
  }
}

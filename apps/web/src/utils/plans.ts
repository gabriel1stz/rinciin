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
    label: 'Paling diminati untuk pelajar, mahasiswa & pekerja muda',
    highlight: 'Paling Populer',
    basePriceMonthly: 9900,
    features: [
      'Semua fitur Free Trial',
      'Unlimited dompet (Bank, E-Wallet, Cash)',
      'Asisten Rinci AI penuh & insight belanja harian',
      'Scan & OCR foto struk belanja',
      'Input transaksi via Voice Note',
      'Advanced Reports & analisis tren',
      'Budget alert overspending realtime',
      'Ekspor data lengkap (CSV & Excel)',
      'Riwayat transaksi tanpa batas',
    ],
    ctaText: 'Upgrade ke Pro',
  },
  {
    id: 'family',
    name: 'Family / Circle',
    label: 'Cocok untuk patungan bareng bestie, pacar, atau keluarga',
    highlight: false,
    basePriceMonthly: 24900,
    features: [
      'Semua fitur Pro',
      'Hingga 5 anggota / teman (multi-user)',
      'Shared budget & shared wallet bersama',
      'Ringkasan arus kas bersama terpadu',
      'Laporan gabungan & individual per anggota',
      'Akses Rinci AI untuk seluruh anggota',
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

  if (plan.id === 'pro') {
    switch (duration) {
      case '6m': {
        return {
          monthlyPrice: 7500,
          totalPrice: 45000,
          originalMonthlyPrice: 9900,
          discountPct: 24,
          months: 6,
          periodLabel: 'Bulan (Total Rp45.000 / 6 Bulan)',
        };
      }
      case '1y': {
        return {
          monthlyPrice: 5750,
          totalPrice: 69000,
          originalMonthlyPrice: 9900,
          discountPct: 42,
          months: 12,
          periodLabel: 'Bulan (Total Rp69.000 / 1 Tahun)',
        };
      }
      case '1m':
      default:
        return {
          monthlyPrice: 9900,
          totalPrice: 9900,
          months: 1,
          periodLabel: 'Bulan',
        };
    }
  }

  // Family plan
  switch (duration) {
    case '6m': {
      return {
        monthlyPrice: 16500,
        totalPrice: 99000,
        originalMonthlyPrice: 24900,
        discountPct: 34,
        months: 6,
        periodLabel: 'Bulan (Total Rp99.000 / 6 Bulan)',
      };
    }
    case '1y': {
      return {
        monthlyPrice: 10750,
        totalPrice: 129000,
        originalMonthlyPrice: 24900,
        discountPct: 57,
        months: 12,
        periodLabel: 'Bulan (Total Rp129.000 / 1 Tahun)',
      };
    }
    case '1m':
    default:
      return {
        monthlyPrice: 24900,
        totalPrice: 24900,
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

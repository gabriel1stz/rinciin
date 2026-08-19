// FinancialSummary.tsx
import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/currency';

interface FinancialSummaryProps {
  isLoading: boolean;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  isLoading,
  totalBalance = 0,
  totalIncome = 0,
  totalExpense = 0,
}) => {
  if (isLoading) {
    return (
      <div className="dashboard-summary-grid">
        <Skeleton height={130} borderRadius="var(--radius-2xl)" />
        <Skeleton height={130} borderRadius="var(--radius-2xl)" />
        <Skeleton height={130} borderRadius="var(--radius-2xl)" />
        <Skeleton height={130} borderRadius="var(--radius-2xl)" />
      </div>
    );
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRatio = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  return (
    <div className="dashboard-summary-grid">
      {/* Card 1: Total Saldo */}
      <div className="summary-card">
        <div>
          <div className="summary-card-top">
            <span className="summary-card-label">Total Saldo</span>
            <div className="summary-card-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className="summary-card-value">{formatCurrency(totalBalance)}</div>
        </div>
        <div className="summary-card-trend text-muted">
          <span>Semua dompet aktif</span>
        </div>
      </div>

      {/* Card 2: Pemasukan Bulan Ini */}
      <div className="summary-card">
        <div>
          <div className="summary-card-top">
            <span className="summary-card-label">Pemasukan Bulan Ini</span>
            <div className="summary-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="summary-card-value" style={{ color: 'var(--success-text)' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>
        <div className="summary-card-trend" style={{ color: 'var(--success-text)' }}>
          <span>+8,2% dari bulan lalu</span>
        </div>
      </div>

      {/* Card 3: Pengeluaran Bulan Ini */}
      <div className="summary-card">
        <div>
          <div className="summary-card-top">
            <span className="summary-card-label">Pengeluaran Bulan Ini</span>
            <div className="summary-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="summary-card-value" style={{ color: 'var(--danger-text)' }}>
            {formatCurrency(totalExpense)}
          </div>
        </div>
        <div className="summary-card-trend" style={{ color: 'var(--danger-text)' }}>
          <span>-4,6% terkendali</span>
        </div>
      </div>

      {/* Card 4: Tabungan / Arus Kas Bersih */}
      <div className="summary-card">
        <div>
          <div className="summary-card-top">
            <span className="summary-card-label">Tabungan Bersih</span>
            <div className="summary-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="summary-card-value" style={{ color: '#6366f1' }}>
            {formatCurrency(netSavings)}
          </div>
        </div>
        <div className="summary-card-trend" style={{ color: '#6366f1' }}>
          <span>Rasio tabungan: {savingsRatio}%</span>
        </div>
      </div>
    </div>
  );
};

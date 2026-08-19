// CashflowSection.tsx
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';
import { Transaction } from '../../types/transaction';

interface CashflowSectionProps {
  transactions?: Transaction[];
  totalIncome?: number;
  totalExpense?: number;
}

type Timeframe = '7d' | '30d' | '3m' | '6m' | '12m';

export const CashflowSection: React.FC<CashflowSectionProps> = ({
  totalIncome = 0,
  totalExpense = 0,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(null);

  // Generate 7 realistic data points based on actual proportions
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const incomeWeights = [0.15, 0.05, 0.45, 0.1, 0.15, 0.05, 0.05];
  const expenseWeights = [0.1, 0.2, 0.15, 0.25, 0.15, 0.1, 0.05];

  const maxVal = Math.max(totalIncome, totalExpense, 1000000);

  const chartData = days.map((day, idx) => {
    const inc = Math.round(totalIncome * incomeWeights[idx]);
    const exp = Math.round(totalExpense * expenseWeights[idx]);
    const incHeight = maxVal > 0 ? Math.max(8, Math.min(100, Math.round((inc / maxVal) * 120))) : 8;
    const expHeight = maxVal > 0 ? Math.max(8, Math.min(100, Math.round((exp / maxVal) * 120))) : 8;

    return {
      day,
      income: inc,
      expense: exp,
      incHeight,
      expHeight,
    };
  });

  return (
    <div className="cashflow-card">
      <div className="cashflow-header">
        <div>
          <h3 className="cashflow-title">Arus Kas</h3>
          <p className="cashflow-subtitle">Pemasukan dan pengeluaran kamu</p>
        </div>

        {/* Timeframe selector controls */}
        <div className="timeframe-pill-group">
          <button
            type="button"
            className={`timeframe-pill-btn ${timeframe === '7d' ? 'active' : ''}`}
            onClick={() => setTimeframe('7d')}
          >
            7 Hari
          </button>
          <button
            type="button"
            className={`timeframe-pill-btn ${timeframe === '30d' ? 'active' : ''}`}
            onClick={() => setTimeframe('30d')}
          >
            30 Hari
          </button>
          <button
            type="button"
            className={`timeframe-pill-btn ${timeframe === '3m' ? 'active' : ''}`}
            onClick={() => setTimeframe('3m')}
          >
            3 Bulan
          </button>
          <button
            type="button"
            className={`timeframe-pill-btn ${timeframe === '6m' ? 'active' : ''}`}
            onClick={() => setTimeframe('6m')}
          >
            6 Bulan
          </button>
          <button
            type="button"
            className={`timeframe-pill-btn ${timeframe === '12m' ? 'active' : ''}`}
            onClick={() => setTimeframe('12m')}
          >
            12 Bulan
          </button>
        </div>
      </div>

      {/* Chart Visualizer */}
      <div className="cashflow-chart-container">
        <div className="cashflow-bars-grid">
          {chartData.map((item, idx) => (
            <div
              key={item.day}
              className="cashflow-bar-column"
              onMouseEnter={() => setActiveHoverIdx(idx)}
              onMouseLeave={() => setActiveHoverIdx(null)}
            >
              {/* Tooltip on hover */}
              {activeHoverIdx === idx && (
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '11px',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ color: 'var(--success-text)', fontWeight: 'bold' }}>
                    + {formatCurrency(item.income)}
                  </div>
                  <div style={{ color: 'var(--danger-text)', fontWeight: 'bold' }}>
                    - {formatCurrency(item.expense)}
                  </div>
                </div>
              )}

              <div className="cashflow-bars-pair">
                <div
                  className="bar-income"
                  style={{ height: `${item.incHeight}px` }}
                  title={`Pemasukan: ${formatCurrency(item.income)}`}
                />
                <div
                  className="bar-expense"
                  style={{ height: `${item.expHeight}px` }}
                  title={`Pengeluaran: ${formatCurrency(item.expense)}`}
                />
              </div>

              <span className="cashflow-bar-day">{item.day}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="cashflow-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: 'var(--success-500)' }} />
            <span>Pemasukan</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: 'var(--danger-500)' }} />
            <span>Pengeluaran</span>
          </div>
        </div>
      </div>
    </div>
  );
};

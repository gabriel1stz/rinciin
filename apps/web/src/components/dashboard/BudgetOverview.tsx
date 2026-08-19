// BudgetOverview.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { Budget } from '../../types/budget';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/currency';

interface BudgetOverviewProps {
  budgets?: Budget[];
  budgetSummary?: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    percentage: number;
    status: string;
  } | null;
  isLoading: boolean;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgets = [],
  budgetSummary,
  isLoading,
}) => {
  const getStatusBadge = (status?: string, pct: number = 0) => {
    if (status === 'SAFE' || pct < 70) return <Badge variant="safe">Aman</Badge>;
    if (status === 'WARNING' || (pct >= 70 && pct <= 90)) return <Badge variant="warning">Waspada</Badge>;
    return <Badge variant="danger">Bahaya</Badge>;
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="card-title">Anggaran Bulan Ini</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Batas pengeluaran per kategori
            </p>
          </div>
          <Link to="/budget">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              Lihat Anggaran
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton height={60} borderRadius="var(--radius-lg)" />
            <Skeleton height={60} borderRadius="var(--radius-lg)" />
          </div>
        ) : budgets.length === 0 && (!budgetSummary || budgetSummary.totalBudget === 0) ? (
          <div className="text-center py-6">
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Belum ada anggaran yang ditetapkan bulan ini.
            </p>
            <Link to="/budget">
              <Button variant="outline" size="sm" leftIcon={<Plus size={14} />}>
                Buat Anggaran
              </Button>
            </Link>
          </div>
        ) : (
          <div className="budget-list-compact">
            {budgets.length > 0 ? (
              budgets.slice(0, 3).map((b) => {
                const spent = Number(b.spent || 0);
                const limit = Number(b.effectiveBudget || b.amount || 0);
                const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

                return (
                  <div key={b.id} className="budget-item-row">
                    <div className="budget-item-header">
                      <div className="flex items-center gap-2">
                        <span>{b.category?.icon || '📁'}</span>
                        <span className="budget-item-name">{b.category?.name || b.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="budget-item-amount">
                          {formatCurrency(spent)} / {formatCurrency(limit)}
                        </span>
                        {getStatusBadge(b.status, pct)}
                      </div>
                    </div>
                    <ProgressBar value={pct} status={b.status as any} height={6} />
                  </div>
                );
              })
            ) : (
              // Fallback to overall summary
              <div className="budget-item-row">
                <div className="budget-item-header">
                  <span className="budget-item-name">Total Seluruh Anggaran</span>
                  <div className="flex items-center gap-2">
                    <span className="budget-item-amount">
                      {formatCurrency(budgetSummary?.totalSpent)} / {formatCurrency(budgetSummary?.totalBudget)}
                    </span>
                    {getStatusBadge(budgetSummary?.status, budgetSummary?.percentage || 0)}
                  </div>
                </div>
                <ProgressBar
                  value={budgetSummary?.percentage || 0}
                  status={budgetSummary?.status as any}
                  height={6}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

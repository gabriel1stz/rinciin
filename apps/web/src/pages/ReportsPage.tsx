// ReportsPage.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Download,
  PieChart,
  Sparkles,
  ArrowDownLeft,
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Tabs } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/currency';
import { formatDateId } from '../utils/date';
import { containerStagger, itemFadeUp } from '../motion/variants';

export const ReportsPage: React.FC = () => {
  const { success } = useToast();
  const [periodTab, setPeriodTab] = useState<'month' | 'three_months' | 'year'>('month');

  const { transactions, isLoading } = useTransactions({ limit: 100 });
  const { wallets } = useWallets();

  // Aggregate Calculations
  const reportData = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryMap: { [key: string]: { name: string; icon: string; total: number } } = {};

    transactions.forEach((tx) => {
      const amount = Number(tx.amount || 0);
      if (tx.type === 'INCOME') {
        income += amount;
      } else if (tx.type === 'EXPENSE') {
        expense += amount;
        const catName = tx.category?.name || 'Lainnya';
        const catIcon = tx.category?.icon || '📁';
        if (!categoryMap[catName]) {
          categoryMap[catName] = { name: catName, icon: catIcon, total: 0 };
        }
        categoryMap[catName].total += amount;
      }
    });

    const categoryList = Object.values(categoryMap).sort((a, b) => b.total - a.total);
    const savingsRatio = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return {
      income,
      expense,
      balance: income - expense,
      savingsRatio,
      categories: categoryList,
    };
  }, [transactions]);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Dompet', 'Nominal', 'Deskripsi', 'Catatan'];
    const rows = transactions.map((t) => [
      t.transactionCode || t.id,
      formatDateId(t.date || t.createdAt),
      t.type,
      t.category?.name || '',
      t.wallet?.name || '',
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Rinci_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('Export Berhasil', 'File CSV laporan transaksi berhasil didownload');
  };

  const handleExportJSON = () => {
    if (transactions.length === 0) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Laporan_Keuangan_Rinci_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);

    success('Export Berhasil', 'File JSON laporan transaksi berhasil didownload');
  };

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={itemFadeUp}>
        <PageHeader
          title="Laporan & Analisis Finansial"
          subtitle="Evaluasi tren cashflow, distribusi pengeluaran, dan kesehatan finansial"
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={handleExportJSON}
              >
                Export JSON
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Period Tabs */}
      <motion.div variants={itemFadeUp} className="flex items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'month', label: 'Bulan Ini' },
            { id: 'three_months', label: '3 Bulan Terakhir' },
            { id: 'year', label: 'Tahun Ini' },
          ]}
          activeTab={periodTab}
          onChange={(tab) => setPeriodTab(tab as any)}
        />
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemFadeUp} className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Pemasukan"
          value={formatCurrency(reportData.income)}
          icon={<TrendingUp size={20} color="var(--success-text)" />}
          iconBg="var(--success-bg)"
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatCurrency(reportData.expense)}
          icon={<TrendingDown size={20} color="var(--danger-text)" />}
          iconBg="var(--danger-bg)"
        />
        <StatCard
          label="Saldo Bersih (Net Cashflow)"
          value={formatCurrency(reportData.balance)}
          icon={<ArrowDownLeft size={20} color="#6366f1" />}
          iconBg="rgba(99, 102, 241, 0.1)"
        />
        <StatCard
          label="Rasio Tabungan"
          value={`${reportData.savingsRatio}%`}
          icon={<PieChart size={20} color="var(--primary-600)" />}
          iconBg="var(--primary-50)"
          trend={{
            value: reportData.savingsRatio >= 20 ? 'Sehat (Target ≥ 20%)' : 'Perlu ditingkatkan',
            isPositive: reportData.savingsRatio >= 20,
          }}
        />
      </motion.div>

      {/* Visual Breakdown Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Category Expenses Breakdown (7 cols) */}
        <motion.div variants={itemFadeUp} className="col-span-12 lg:col-span-7" style={{ gridColumn: 'span 7' }}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Distribusi Pengeluaran per Kategori</CardTitle>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Kategori dengan porsi pengeluaran terbesar
                </p>
              </div>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton height={30} />
                  <Skeleton height={30} />
                  <Skeleton height={30} />
                </div>
              ) : reportData.categories.length === 0 ? (
                <EmptyState
                  title="Belum ada data pengeluaran"
                  description="Catat transaksi pengeluaran untuk melihat grafik distribusi kategori."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {reportData.categories.map((cat) => {
                    const percentage = reportData.expense > 0 ? Math.round((cat.total / reportData.expense) * 100) : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                              {cat.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                              {formatCurrency(cat.total)}
                            </span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', width: '36px', textAlign: 'right' }}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="category-breakdown-bar">
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: 'var(--danger-500)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Wallet Distribution & AI Insights (5 cols) */}
        <motion.div variants={itemFadeUp} className="col-span-12 lg:col-span-5" style={{ gridColumn: 'span 5' }}>
          <div className="flex flex-col gap-6">
            {/* Wallets Allocation */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Alokasi Saldo Dompet</CardTitle>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Penyebaran aset pada masing-masing dompet
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Skeleton height={120} />
                ) : wallets.length === 0 ? (
                  <EmptyState title="Belum ada dompet" description="Tambahkan dompet untuk melihat saldo." />
                ) : (
                  <div className="flex flex-col gap-3">
                    {wallets.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="flex items-center gap-2">
                          <span>{w.icon || '💳'}</span>
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                            {w.name}
                          </span>
                        </div>
                        <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                          {formatCurrency(w.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Smart Financial Insights Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.15))',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-6)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} color="var(--primary-600)" />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                  Evaluasi Finansial Cerdas
                </h4>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                {reportData.expense > reportData.income
                  ? '⚠️ Pengeluaranmu bulan ini melebihi total pemasukan. Tinjau kembali kategori pengeluaran teratas untuk menekan biaya yang tidak mendesak.'
                  : reportData.savingsRatio >= 20
                  ? '🎉 Kondisi keuanganmu sangat prima! Kamu berhasil menyisihkan lebih dari 20% pemasukan untuk tabungan dan investasi.'
                  : '💡 Arus kasmu positif, namun usahakan meningkatkan alokasi tabungan hingga mencapai target ideal 20% dari total pemasukan.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

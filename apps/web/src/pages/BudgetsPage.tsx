// BudgetsPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  PieChart as PieChartIcon,
  ShieldCheck,
  AlertTriangle,
  Edit2,
  Trash2,
  Layers,
} from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { formatCurrency } from '../utils/currency';
import { Budget, BudgetPeriod } from '../types/budget';
import { containerStagger, itemFadeUp } from '../motion/variants';

const PERIOD_OPTIONS = [
  { value: 'MONTHLY', label: 'Bulanan' },
  { value: 'WEEKLY', label: 'Mingguan' },
  { value: 'DAILY', label: 'Harian' },
  { value: 'YEARLY', label: 'Tahunan' },
];

export const BudgetsPage: React.FC = () => {
  const { success, error } = useToast();
  const { budgets, isLoading, createBudget, updateBudget, deleteBudget, isCreating, isUpdating } =
    useBudgets();
  const { categories } = useCategories();
  const { wallets } = useWallets();

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formCategoryName, setFormCategoryName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPeriod, setFormPeriod] = useState<BudgetPeriod>('MONTHLY');
  const [formWalletId, setFormWalletId] = useState('');
  const [formCarryOver, setFormCarryOver] = useState(false);
  const [formNotification, setFormNotification] = useState(true);

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.effectiveBudget || b.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const handleOpenCreate = () => {
    if (expenseCategories.length > 0) {
      setFormCategoryName(expenseCategories[0].name);
    }
    setFormAmount('');
    setFormPeriod('MONTHLY');
    setFormWalletId('');
    setFormCarryOver(false);
    setFormNotification(true);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormCategoryName(b.category?.name || b.name || '');
    setFormAmount(String(b.amount));
    setFormPeriod(b.period || 'MONTHLY');
    setFormWalletId(b.walletId || '');
    setFormCarryOver(b.carryOver || false);
    setFormNotification(b.notification !== false);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(formAmount);
    if (!numericAmount || numericAmount <= 0) {
      error('Nominal Batas Tidak Valid', 'Masukkan nominal batas anggaran lebih dari 0');
      return;
    }

    try {
      if (editingBudget) {
        await updateBudget({
          id: editingBudget.id,
          payload: {
            amount: numericAmount,
            period: formPeriod,
            walletId: formWalletId || undefined,
            carryOver: formCarryOver,
            notification: formNotification,
          },
        });
        success('Berhasil', 'Anggaran berhasil diperbarui');
        setEditingBudget(null);
      } else {
        await createBudget({
          categoryName: formCategoryName,
          amount: numericAmount,
          period: formPeriod,
          walletId: formWalletId || undefined,
          carryOver: formCarryOver,
          notification: formNotification,
        });
        success('Berhasil', 'Anggaran baru berhasil dibuat');
        setIsCreateOpen(false);
      }
    } catch (err: any) {
      error('Gagal Menyimpan Anggaran', err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBudget(deletingId);
      success('Berhasil Dihapus', 'Anggaran berhasil dihapus');
      setDeletingId(null);
    } catch (err: any) {
      error('Gagal Menghapus Anggaran', err.response?.data?.message || err.message);
    }
  };

  const getStatusBadge = (status?: string, pct: number = 0) => {
    if (status === 'SAFE' || pct < 70) return <Badge variant="safe">Aman ({pct}%)</Badge>;
    if (status === 'WARNING' || (pct >= 70 && pct <= 90)) return <Badge variant="warning">Waspada ({pct}%)</Badge>;
    return <Badge variant="danger">Bahaya ({pct}%)</Badge>;
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
          title="Anggaran Keuangan"
          subtitle="Kendalikan pengeluaran dengan batas anggaran cerdas per kategori"
          action={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleOpenCreate}
            >
              + Buat Anggaran
            </Button>
          }
        />
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemFadeUp} className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Anggaran Ditetapkan"
          value={formatCurrency(totalBudgeted)}
          icon={<PieChartIcon size={20} color="var(--primary-600)" />}
          iconBg="var(--primary-50)"
        />
        <StatCard
          label="Total Terpakai"
          value={formatCurrency(totalSpent)}
          icon={<AlertTriangle size={20} color={overallPercentage > 85 ? 'var(--danger-text)' : 'var(--warning-text)'} />}
          iconBg={overallPercentage > 85 ? 'var(--danger-bg)' : 'var(--warning-bg)'}
        />
        <StatCard
          label="Sisa Anggaran"
          value={formatCurrency(totalRemaining)}
          icon={<ShieldCheck size={20} color="var(--success-text)" />}
          iconBg="var(--success-bg)"
        />
        <StatCard
          label="Persentase Terpakai"
          value={`${overallPercentage}%`}
          icon={<Layers size={20} color="#6366f1" />}
          iconBg="rgba(99, 102, 241, 0.1)"
        />
      </motion.div>

      {/* Budgets Grid */}
      <motion.div variants={itemFadeUp}>
        {isLoading ? (
          <div className="budget-grid">
            <Skeleton height={200} borderRadius="var(--radius-2xl)" />
            <Skeleton height={200} borderRadius="var(--radius-2xl)" />
            <Skeleton height={200} borderRadius="var(--radius-2xl)" />
          </div>
        ) : budgets.length === 0 ? (
          <EmptyState
            title="Belum ada anggaran"
            description="Buat anggaran untuk kategori pengeluaran seperti Makanan, Transportasi, atau Belanja untuk mengontrol keuanganmu."
            actionText="+ Buat Anggaran Pertama"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="budget-grid">
            {budgets.map((b) => {
              const spent = Number(b.spent || 0);
              const limit = Number(b.effectiveBudget || b.amount || 0);
              const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
              const remaining = Number(b.remaining !== undefined ? b.remaining : limit - spent);

              return (
                <div key={b.id} className="budget-card">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                          }}
                        >
                          {b.category?.icon || '📁'}
                        </div>
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                            {b.category?.name || b.name}
                          </h4>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            Periode {b.period?.toLowerCase() || 'bulanan'}
                          </span>
                        </div>
                      </div>

                      {getStatusBadge(b.status, percentage)}
                    </div>

                    <div style={{ margin: 'var(--space-4) 0' }}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                          {formatCurrency(spent)}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          dari {formatCurrency(limit)}
                        </span>
                      </div>

                      <ProgressBar
                        value={percentage}
                        status={b.status as any}
                        height={8}
                      />
                    </div>

                    <div className="flex items-center justify-between" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      <span>
                        Sisa:{' '}
                        <strong style={{ color: remaining < 0 ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                          {formatCurrency(remaining)}
                        </strong>
                      </span>
                      {b.carryOver && <span title="Sisa budget diteruskan ke bulan berikutnya">🔄 Teruskan sisa</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center justify-end gap-1"
                    style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Edit2 size={14} />}
                      onClick={() => handleOpenEdit(b)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => setDeletingId(b.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modal Create / Edit Budget */}
      <Modal
        isOpen={isCreateOpen || !!editingBudget}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? 'Edit Anggaran' : 'Buat Anggaran Baru'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingBudget(null);
              }}
              disabled={isCreating || isUpdating}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveBudget}
              isLoading={isCreating || isUpdating}
            >
              Simpan Anggaran
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveBudget}>
          {!editingBudget ? (
            <Select
              label="Kategori Pengeluaran"
              value={formCategoryName}
              onChange={(e) => setFormCategoryName(e.target.value)}
              options={expenseCategories.map((c) => ({
                value: c.name,
                label: `${c.icon || '📁'} ${c.name}`,
              }))}
              required
            />
          ) : (
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', padding: '0.5rem 0' }}>
                {formCategoryName}
              </div>
            </div>
          )}

          <Input
            label="Batas Anggaran (Rp)"
            type="number"
            placeholder="Contoh: 2000000"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Periode"
              value={formPeriod}
              onChange={(e) => setFormPeriod(e.target.value as any)}
              options={PERIOD_OPTIONS}
            />

            <Select
              label="Batasi ke Dompet Tertentu (Opsional)"
              value={formWalletId}
              onChange={(e) => setFormWalletId(e.target.value)}
              options={[
                { value: '', label: 'Semua Dompet' },
                ...wallets.map((w) => ({ value: w.id, label: `${w.icon || '💳'} ${w.name}` })),
              ]}
            />
          </div>

          <div className="flex flex-col gap-3 mt-4" style={{ marginTop: 'var(--space-4)' }}>
            <Switch
              checked={formCarryOver}
              onChange={setFormCarryOver}
              label="Carry-over (Teruskan sisa saldo ke periode berikutnya)"
            />
            <Switch
              checked={formNotification}
              onChange={setFormNotification}
              label="Kirim notifikasi peringatan saat anggaran hampir habis (>80%)"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus Anggaran"
        message="Apakah kamu yakin ingin menghapus anggaran ini? Riwayat pengeluaran tidak akan terhapus."
        confirmText="Hapus Anggaran"
        isDanger
      />
    </motion.div>
  );
};

// TransactionsPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Upload,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Printer,
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBox } from '../components/ui/SearchBox';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { TransactionModal } from '../components/modals/TransactionModal';
import { formatCurrency, formatSignedCurrency } from '../utils/currency';
import { formatRelativeDateId } from '../utils/date';
import { exportTransactionsToCsv, printFinancialReport } from '../utils/export';
import { useDebounce } from '../hooks/useDebounce';
import { Transaction } from '../types/transaction';
import { containerStagger, itemFadeUp } from '../motion/variants';

export const TransactionsPage: React.FC = () => {
  const { success, error } = useToast();
  const { wallets } = useWallets();
  const { categories } = useCategories();

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'' | 'INCOME' | 'EXPENSE'>('');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const {
    transactions,
    pagination,
    isLoading,
    deleteTransaction,
    uploadReceipt,
  } = useTransactions({
    search: debouncedSearch || undefined,
    type: type || undefined,
    walletId: walletId || undefined,
    categoryId: categoryId || undefined,
    page,
    limit: 15,
  });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Receipt modal state
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const netIncome = totalIncome - totalExpense;

  const handleExportCsv = () => {
    try {
      exportTransactionsToCsv(transactions, `rinci-transaksi-${new Date().toISOString().slice(0, 10)}.csv`);
      success('Export Berhasil', 'File CSV transaksi berhasil diunduh.');
    } catch (err: any) {
      error('Gagal Export CSV', err.message);
    }
  };

  const handlePrintReport = () => {
    try {
      printFinancialReport(
        transactions,
        { totalIncome, totalExpense, net: netIncome },
        'Laporan Transaksi Keuangan'
      );
    } catch (err: any) {
      error('Gagal Cetak Laporan', err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTransaction(deletingId);
      success('Berhasil', 'Transaksi berhasil dihapus');
      setDeletingId(null);
    } catch (err: any) {
      error('Gagal Menghapus', err.response?.data?.message || err.message);
    }
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptTx || !selectedFile) return;

    setIsUploading(true);
    try {
      await uploadReceipt({ id: receiptTx.id, file: selectedFile });
      success('Upload Berhasil', 'Bukti struk transaksi berhasil disimpan');
      setReceiptTx(null);
      setSelectedFile(null);
    } catch (err: any) {
      error('Gagal Upload Struk', err.response?.data?.message || err.message);
    } finally {
      setIsUploading(false);
    }
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
          title="Riwayat Transaksi"
          subtitle="Catat dan pantau seluruh arus keluar masuk keuanganmu"
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={handleExportCsv}
                disabled={transactions.length === 0}
                title="Unduh format spreadsheet CSV"
              >
                <span>Export CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer size={14} />}
                onClick={handlePrintReport}
                disabled={transactions.length === 0}
                title="Cetak atau simpan sebagai PDF"
              >
                <span>Cetak / PDF</span>
              </Button>

              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsCreateOpen(true)}
              >
                + Transaksi Baru
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Summary Stat Cards */}
      <motion.div variants={itemFadeUp} className="transaction-summary-grid">
        <StatCard
          label="Pemasukan (Halaman Ini)"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp size={20} color="var(--success-text)" />}
          iconBg="var(--success-bg)"
        />
        <StatCard
          label="Pengeluaran (Halaman Ini)"
          value={formatCurrency(totalExpense)}
          icon={<TrendingDown size={20} color="var(--danger-text)" />}
          iconBg="var(--danger-bg)"
        />
        <StatCard
          label="Selisih Arus Kas"
          value={formatCurrency(totalIncome - totalExpense)}
          icon={<ArrowDownLeft size={20} color="#6366f1" />}
          iconBg="rgba(99, 102, 241, 0.1)"
        />
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemFadeUp} className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <SearchBox
            value={search}
            onChangeValue={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Cari deskripsi atau catatan..."
          />
        </div>

        <div style={{ width: '160px' }}>
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value as any);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Tipe' },
              { value: 'EXPENSE', label: 'Pengeluaran' },
              { value: 'INCOME', label: 'Pemasukan' },
            ]}
          />
        </div>

        <div style={{ width: '180px' }}>
          <Select
            value={walletId}
            onChange={(e) => {
              setWalletId(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Dompet' },
              ...wallets.map((w) => ({ value: w.id, label: `${w.icon || '💳'} ${w.name}` })),
            ]}
          />
        </div>

        <div style={{ width: '180px' }}>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Kategori' },
              ...categories.map((c) => ({ value: c.id, label: `${c.icon || '📁'} ${c.name}` })),
            ]}
          />
        </div>
      </motion.div>

      {/* Transactions Table & Mobile Cards */}
      <motion.div variants={itemFadeUp}>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi"
            description="Tidak ada transaksi yang cocok dengan filter atau pencarian saat ini."
            actionText="+ Catat Transaksi Baru"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container table-desktop-view">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Deskripsi & Catatan</th>
                    <th>Dompet</th>
                    <th>Tipe</th>
                    <th style={{ textAlign: 'right' }}>Jumlah</th>
                    <th style={{ textAlign: 'center' }}>Struk</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                        {formatRelativeDateId(tx.date || tx.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span>{tx.category?.icon || '📁'}</span>
                          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {tx.category?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {tx.description || tx.note || 'Transaksi'}
                          </div>
                          {tx.note && tx.description && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                              {tx.note}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">
                          {tx.wallet?.icon || '💳'} {tx.wallet?.name || '-'}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'}>
                          {tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 'var(--font-weight-bold)',
                          fontFamily: 'var(--font-mono)',
                          color: tx.type === 'INCOME' ? 'var(--success-text)' : 'var(--danger-text)',
                        }}
                      >
                        {formatSignedCurrency(tx.amount, tx.type)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {tx.receiptUrl ? (
                          <a
                            href={tx.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-sm"
                            title="Lihat Struk"
                          >
                            <Receipt size={16} color="var(--primary-500)" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Upload Struk"
                            onClick={() => setReceiptTx(tx)}
                          >
                            <Upload size={14} color="var(--text-tertiary)" />
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTx(tx)}
                            aria-label="Edit Transaksi"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger"
                            onClick={() => setDeletingId(tx.id)}
                            aria-label="Hapus Transaksi"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="transaction-mobile-list">
              {transactions.map((tx) => (
                <div key={tx.id} className="transaction-mobile-card">
                  <div className="transaction-mobile-header">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: tx.type === 'INCOME' ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: tx.type === 'INCOME' ? 'var(--success-text)' : 'var(--danger-text)',
                        }}
                      >
                        {tx.type === 'INCOME' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                          {tx.description || tx.note || 'Transaksi'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          {formatRelativeDateId(tx.date || tx.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div
                      className="transaction-mobile-amount"
                      style={{ color: tx.type === 'INCOME' ? 'var(--success-text)' : 'var(--danger-text)' }}
                    >
                      {formatSignedCurrency(tx.amount, tx.type)}
                    </div>
                  </div>

                  <div className="transaction-mobile-body">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">
                        {tx.wallet?.icon || '💳'} {tx.wallet?.name}
                      </Badge>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {tx.category?.icon} {tx.category?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTx(tx)}
                        aria-label="Edit Transaksi"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        onClick={() => setDeletingId(tx.id)}
                        aria-label="Hapus Transaksi"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <motion.div
          variants={itemFadeUp}
          className="flex items-center justify-between"
          style={{ marginTop: 'var(--space-4)' }}
        >
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} transaksi)
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </motion.div>
      )}

      {/* Transaction Modal (Create or Edit) */}
      <TransactionModal
        isOpen={isCreateOpen || !!editingTx}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTx(null);
        }}
        transactionToEdit={editingTx}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message="Apakah kamu yakin ingin menghapus transaksi ini? Saldo dompet terkait akan disesuaikan kembali secara otomatis."
        confirmText="Hapus Transaksi"
        isDanger
      />

      {/* Upload Receipt Modal */}
      <Modal
        isOpen={!!receiptTx}
        onClose={() => {
          setReceiptTx(null);
          setSelectedFile(null);
        }}
        title="Upload Bukti Struk"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setReceiptTx(null);
                setSelectedFile(null);
              }}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadReceipt}
              isLoading={isUploading}
              disabled={!selectedFile}
            >
              Upload Struk
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadReceipt}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Pilih file gambar struk / nota transaksi (PNG, JPG, JPEG):
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="form-input"
            required
          />
        </form>
      </Modal>
    </motion.div>
  );
};

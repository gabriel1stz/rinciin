// WalletsPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  ArrowRightLeft,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useWallets } from '../hooks/useWallets';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBox } from '../components/ui/SearchBox';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatCurrency } from '../utils/currency';
import { useDebounce } from '../hooks/useDebounce';
import { Wallet } from '../types/wallet';
import { containerStagger, itemFadeUp } from '../motion/variants';

const WALLET_TYPES = [
  { value: 'cash', label: '💵 Uang Tunai (Cash)' },
  { value: 'bank', label: '🏦 Rekening Bank' },
  { value: 'ewallet', label: '📱 E-Wallet' },
  { value: 'investment', label: '📈 Investasi' },
  { value: 'other', label: '📁 Lainnya' },
];

const WALLET_ICONS = ['💵', '🏦', '💳', '📱', '🪙', '📈', '💼', '🐖'];

export const WalletsPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const {
    wallets,
    isLoading,
    createWallet,
    updateWallet,
    deleteWallet,
    transferWallet,
    archiveWallet,
    restoreWallet,
    isCreating,
    isUpdating,
    isTransferring,
  } = useWallets({
    search: debouncedSearch || undefined,
    includeArchived: activeTab === 'archived',
  });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('cash');
  const [formBalance, setFormBalance] = useState('');
  const [formIcon, setFormIcon] = useState('💵');
  const [formIsDefault, setFormIsDefault] = useState(false);

  // Transfer form states
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  const activeWallets = wallets.filter((w) => !w.archived);
  const totalBalance = activeWallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  const handleOpenCreate = () => {
    setFormName('');
    setFormType('cash');
    setFormBalance('');
    setFormIcon('💵');
    setFormIsDefault(false);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setFormName(w.name);
    setFormType(w.type || 'cash');
    setFormBalance(String(w.balance || 0));
    setFormIcon(w.icon || '💵');
    setFormIsDefault(w.isDefault || false);
  };

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error('Nama Dompet Wajib Diisi');
      return;
    }

    try {
      if (editingWallet) {
        await updateWallet({
          id: editingWallet.id,
          payload: {
            name: formName.trim(),
            type: formType,
            balance: formBalance ? Number(formBalance) : undefined,
            icon: formIcon,
            isDefault: formIsDefault,
          },
        });
        success('Berhasil', 'Dompet berhasil diperbarui');
        setEditingWallet(null);
      } else {
        await createWallet({
          name: formName.trim(),
          type: formType,
          balance: Number(formBalance) || 0,
          icon: formIcon,
          isDefault: formIsDefault,
        });
        success('Berhasil', 'Dompet baru berhasil ditambahkan');
        setIsCreateOpen(false);
      }
    } catch (err: any) {
      error('Gagal Menyimpan Dompet', err.response?.data?.message || err.message);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(transferAmount);
    if (!amountNum || amountNum <= 0) {
      error('Nominal Tidak Valid', 'Masukkan nominal transfer yang benar');
      return;
    }
    if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) {
      error('Dompet Tidak Valid', 'Pilih dompet asal dan dompet tujuan yang berbeda');
      return;
    }

    try {
      await transferWallet({
        fromWalletId,
        toWalletId,
        amount: amountNum,
        description: transferDesc.trim() || undefined,
      });
      success('Transfer Berhasil', `Berhasil memindahkan ${formatCurrency(amountNum)}`);
      setIsTransferOpen(false);
      setTransferAmount('');
      setTransferDesc('');
    } catch (err: any) {
      error('Transfer Gagal', err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteWallet(confirmDeleteId);
      success('Berhasil Dihapus', 'Dompet berhasil dihapus/diarsipkan');
      setConfirmDeleteId(null);
    } catch (err: any) {
      error('Gagal Menghapus Dompet', err.response?.data?.message || err.message);
    }
  };

  const handleArchive = async () => {
    if (!confirmArchiveId) return;
    try {
      await archiveWallet(confirmArchiveId);
      success('Berhasil Diarsipkan', 'Dompet dipindahkan ke daftar arsip');
      setConfirmArchiveId(null);
    } catch (err: any) {
      error('Gagal Mengarsipkan', err.response?.data?.message || err.message);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreWallet(id);
      success('Berhasil Dipulihkan', 'Dompet kembali aktif');
    } catch (err: any) {
      error('Gagal Memulihkan', err.response?.data?.message || err.message);
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
          title="Dompet Saya"
          subtitle={`Total Saldo: ${formatCurrency(totalBalance)}`}
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                leftIcon={<ArrowRightLeft size={16} />}
                onClick={() => {
                  if (activeWallets.length >= 2) {
                    setFromWalletId(activeWallets[0].id);
                    setToWalletId(activeWallets[1].id);
                  }
                  setIsTransferOpen(true);
                }}
              >
                Transfer Saldo
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={handleOpenCreate}
              >
                + Dompet Baru
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Filter and Tabs */}
      <motion.div variants={itemFadeUp} className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs
          tabs={[
            { id: 'active', label: 'Dompet Aktif' },
            { id: 'archived', label: 'Diarsipkan' },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        <SearchBox
          value={search}
          onChangeValue={setSearch}
          placeholder="Cari nama dompet..."
        />
      </motion.div>

      {/* Wallet Cards Grid */}
      <motion.div variants={itemFadeUp}>
        {isLoading ? (
          <div className="wallet-card-grid">
            <Skeleton height={180} borderRadius="var(--radius-2xl)" />
            <Skeleton height={180} borderRadius="var(--radius-2xl)" />
            <Skeleton height={180} borderRadius="var(--radius-2xl)" />
          </div>
        ) : wallets.length === 0 ? (
          <EmptyState
            title={activeTab === 'active' ? 'Belum ada dompet' : 'Tidak ada dompet yang diarsipkan'}
            description={
              activeTab === 'active'
                ? 'Tambahkan dompet pertama untuk mulai mengelola uang tunai, bank, atau e-wallet.'
                : 'Dompet yang diarsipkan akan muncul di sini.'
            }
            actionText={activeTab === 'active' ? '+ Tambah Dompet' : undefined}
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="wallet-card-grid">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="wallet-card-premium">
                <div className="wallet-card-top">
                  <div className="flex items-center gap-3">
                    <div className="wallet-icon-box">{wallet.icon || '💳'}</div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                        {wallet.name}
                      </h4>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {wallet.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {wallet.isDefault && <Badge variant="safe">Utama</Badge>}
                    {wallet.archived && <Badge variant="neutral">Arsip</Badge>}
                  </div>
                </div>

                <div className="wallet-balance">{formatCurrency(wallet.balance)}</div>

                {/* Card Actions */}
                <div
                  className="flex items-center justify-between"
                  style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}
                >
                  {!wallet.archived ? (
                    <div className="flex gap-1 w-full justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit2 size={14} />}
                        onClick={() => handleOpenEdit(wallet)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Archive size={14} />}
                        onClick={() => setConfirmArchiveId(wallet.id)}
                      >
                        Arsipkan
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => setConfirmDeleteId(wallet.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<RotateCcw size={14} />}
                        onClick={() => handleRestore(wallet.id)}
                      >
                        Pulihkan Dompet
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal Create/Edit Wallet */}
      <Modal
        isOpen={isCreateOpen || !!editingWallet}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingWallet(null);
        }}
        title={editingWallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingWallet(null);
              }}
              disabled={isCreating || isUpdating}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveWallet}
              isLoading={isCreating || isUpdating}
            >
              Simpan Dompet
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveWallet}>
          {/* Icon Selector */}
          <div className="form-group">
            <label className="form-label">Pilih Ikon</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  style={{
                    fontSize: '1.5rem',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-lg)',
                    border: formIcon === icon ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    background: formIcon === icon ? 'var(--primary-50)' : 'var(--bg-input)',
                  }}
                  onClick={() => setFormIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Nama Dompet"
            placeholder="Contoh: Rekening BCA, Dompet Fisik, GoPay"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Tipe Dompet"
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            options={WALLET_TYPES}
          />

          <Input
            label="Saldo Saat Ini (Rp)"
            type="number"
            placeholder="0"
            value={formBalance}
            onChange={(e) => setFormBalance(e.target.value)}
          />

          <div style={{ marginTop: 'var(--space-2)' }}>
            <Switch
              checked={formIsDefault}
              onChange={setFormIsDefault}
              label="Jadikan sebagai Dompet Utama (Default)"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Transfer Between Wallets */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Saldo Antar Dompet"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsTransferOpen(false)} disabled={isTransferring}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleTransfer} isLoading={isTransferring}>
              Kirim Transfer
            </Button>
          </>
        }
      >
        <form onSubmit={handleTransfer}>
          <Select
            label="Dompet Asal (Pengirim)"
            value={fromWalletId}
            onChange={(e) => setFromWalletId(e.target.value)}
            options={activeWallets.map((w) => ({
              value: w.id,
              label: `${w.icon || '💳'} ${w.name} (${formatCurrency(w.balance)})`,
            }))}
            required
          />

          <Select
            label="Dompet Tujuan (Penerima)"
            value={toWalletId}
            onChange={(e) => setToWalletId(e.target.value)}
            options={activeWallets.map((w) => ({
              value: w.id,
              label: `${w.icon || '💳'} ${w.name} (${formatCurrency(w.balance)})`,
            }))}
            required
          />

          <Input
            label="Nominal Transfer (Rp)"
            type="number"
            placeholder="0"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            required
          />

          <Input
            label="Catatan Transfer (Opsional)"
            placeholder="Contoh: Tarik tunai dari ATM"
            value={transferDesc}
            onChange={(e) => setTransferDesc(e.target.value)}
          />
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Dompet"
        message="Apakah kamu yakin ingin menghapus dompet ini? Jika dompet memiliki riwayat transaksi, dompet akan diarsipkan."
        confirmText="Hapus"
        isDanger
      />

      {/* Confirm Archive */}
      <ConfirmDialog
        isOpen={!!confirmArchiveId}
        onClose={() => setConfirmArchiveId(null)}
        onConfirm={handleArchive}
        title="Arsipkan Dompet"
        message="Dompet yang diarsipkan tidak akan muncul di pilihan transaksi baru, namun data riwayatnya tetap tersimpan."
        confirmText="Arsipkan"
      />
    </motion.div>
  );
};

// TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { useWallets } from '../../hooks/useWallets';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { useToast } from '../../context/ToastContext';
import { Transaction } from '../../types/transaction';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { wallets } = useWallets();
  const { categories } = useCategories();
  const { createTransaction, updateTransaction, isCreating, isUpdating } = useTransactions();
  const { success, error } = useToast();

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [walletId, setWalletId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type === 'INCOME' ? 'INCOME' : 'EXPENSE');
      setWalletId(transactionToEdit.walletId);
      setCategoryId(transactionToEdit.categoryId);
      setAmount(String(transactionToEdit.amount));
      setDescription(transactionToEdit.description || '');
      setNote(transactionToEdit.note || '');
      setDate(
        transactionToEdit.date
          ? new Date(transactionToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
    } else {
      setType('EXPENSE');
      setAmount('');
      setDescription('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      if (wallets.length > 0) {
        const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0];
        setWalletId(defaultWallet.id);
      }
      if (categories.length > 0) {
        const firstCategory = categories.find((c) => c.type === 'EXPENSE') || categories[0];
        setCategoryId(firstCategory.id);
      }
    }
  }, [transactionToEdit, isOpen, wallets, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      error('Nominal tidak valid', 'Masukkan nominal lebih dari 0');
      return;
    }

    const selectedWallet = wallets.find((w) => w.id === walletId);
    const selectedCategory = categories.find((c) => c.id === categoryId);

    if (!selectedWallet) {
      error('Pilih Dompet', 'Pilih dompet yang digunakan untuk transaksi');
      return;
    }

    if (!selectedCategory) {
      error('Pilih Kategori', 'Pilih kategori transaksi');
      return;
    }

    try {
      if (transactionToEdit) {
        await updateTransaction({
          id: transactionToEdit.id,
          payload: {
            walletId: selectedWallet.id,
            categoryId: selectedCategory.id,
            type,
            amount: numericAmount,
            description: description.trim() || undefined,
            note: note.trim() || undefined,
            date: new Date(date).toISOString(),
          },
        });
        success('Berhasil', 'Transaksi berhasil diperbarui');
      } else {
        await createTransaction({
          walletName: selectedWallet.name,
          categoryName: selectedCategory.name,
          type,
          amount: numericAmount,
          description: description.trim() || undefined,
          note: note.trim() || undefined,
          date: new Date(date).toISOString(),
        });
        success('Berhasil', 'Transaksi baru berhasil dicatat');
      }
      onClose();
    } catch (err: any) {
      error('Gagal Menyimpan Transaksi', err.response?.data?.message || err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isCreating || isUpdating}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isCreating || isUpdating}
          >
            {transactionToEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Type Selector Tabs */}
        <div className="flex gap-2 mb-4" style={{ marginBottom: 'var(--space-4)' }}>
          <button
            type="button"
            className={`btn flex-1 ${type === 'EXPENSE' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => {
              setType('EXPENSE');
              const firstExp = categories.find((c) => c.type === 'EXPENSE');
              if (firstExp) setCategoryId(firstExp.id);
            }}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            className={`btn flex-1 ${type === 'INCOME' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setType('INCOME');
              const firstInc = categories.find((c) => c.type === 'INCOME');
              if (firstInc) setCategoryId(firstInc.id);
            }}
          >
            Pemasukan
          </button>
        </div>

        {/* Nominal Amount */}
        <Input
          label="Jumlah (Rp)"
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Wallet Selector */}
          <Select
            label="Dompet"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            options={wallets.map((w) => ({
              value: w.id,
              label: `${w.icon || '💳'} ${w.name}`,
            }))}
            required
          />

          {/* Category Selector */}
          <Select
            label="Kategori"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={filteredCategories.map((c) => ({
              value: c.id,
              label: `${c.icon || '📁'} ${c.name}`,
            }))}
            required
          />
        </div>

        {/* Date */}
        <Input
          label="Tanggal"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Description / Title */}
        <Input
          label="Deskripsi / Judul"
          placeholder="Contoh: Makan siang Nasi Padang"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Note */}
        <Textarea
          label="Catatan Tambahan (Opsional)"
          placeholder="Catatan detail..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};

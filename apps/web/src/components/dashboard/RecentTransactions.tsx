// RecentTransactions.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '../../types/transaction';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { formatSignedCurrency } from '../../utils/currency';
import { formatRelativeDateId } from '../../utils/date';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
  onOpenCreateModal?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions = [],
  isLoading,
  onOpenCreateModal,
}) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="card-title">Transaksi Terakhir</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Catatan mutasi keuangan terbaru
          </p>
        </div>
        <Link to="/transactions">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            Lihat Semua
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton height={50} />
          <Skeleton height={50} />
          <Skeleton height={50} />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description="Catat transaksi pertamamu untuk mulai memantau arus kas harian."
          actionText="+ Tambah Transaksi"
          onAction={onOpenCreateModal}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="table-container table-desktop-view">
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Kategori & Keterangan</th>
                  <th>Dompet</th>
                  <th>Tipe</th>
                  <th style={{ textAlign: 'right' }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                      {formatRelativeDateId(tx.date || tx.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{
                            width: '1.75rem',
                            height: '1.75rem',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: tx.type === 'INCOME' ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: tx.type === 'INCOME' ? 'var(--success-text)' : 'var(--danger-text)',
                          }}
                        >
                          {tx.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                            {tx.description || tx.note || 'Transaksi'}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            {tx.category?.name || 'Umum'}
                          </div>
                        </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="transaction-mobile-list">
            {transactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="transaction-mobile-card">
                <div className="transaction-mobile-header">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: '1.875rem',
                        height: '1.875rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: tx.type === 'INCOME' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: tx.type === 'INCOME' ? 'var(--success-text)' : 'var(--danger-text)',
                        flexShrink: 0,
                      }}
                    >
                      {tx.type === 'INCOME' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
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
                    style={{
                      color: tx.type === 'INCOME' ? 'var(--success-text)' : 'var(--danger-text)',
                      fontSize: 'var(--font-size-sm)',
                    }}
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
                      {tx.category?.name}
                    </span>
                  </div>
                  <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'}>
                    {tx.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

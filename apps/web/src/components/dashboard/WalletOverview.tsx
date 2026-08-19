// WalletOverview.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Wallet } from '../../types/wallet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/currency';

interface WalletOverviewProps {
  wallets: Wallet[];
  isLoading: boolean;
  onOpenCreateWallet?: () => void;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  wallets = [],
  isLoading,
  onOpenCreateWallet,
}) => {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="card-title">Dompet</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {wallets.length} dompet aktif
            </p>
          </div>
          <Link to="/wallet">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              Lihat semua
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="wallet-grid-compact">
            <Skeleton height={90} borderRadius="var(--radius-xl)" />
            <Skeleton height={90} borderRadius="var(--radius-xl)" />
          </div>
        ) : wallets.length === 0 ? (
          <EmptyState
            title="Belum ada dompet"
            description="Tambahkan dompet untuk mulai memantau saldo kamu."
            actionText="+ Tambah Dompet"
            onAction={onOpenCreateWallet}
          />
        ) : (
          <div className="wallet-grid-compact">
            {wallets.slice(0, 4).map((w) => (
              <div key={w.id} className="wallet-card-item">
                <div className="wallet-card-top-row">
                  <div className="flex items-center gap-2">
                    <div className="wallet-icon-badge">{w.icon || '💳'}</div>
                    <div>
                      <div className="wallet-card-name">{w.name}</div>
                      <div className="wallet-card-type">{w.type || 'Tunai'}</div>
                    </div>
                  </div>
                  {w.isDefault && <Badge variant="safe">Utama</Badge>}
                </div>
                <div className="wallet-card-balance">{formatCurrency(w.balance)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

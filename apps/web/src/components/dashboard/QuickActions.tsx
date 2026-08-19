// QuickActions.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Wallet, PieChart, ArrowRightLeft } from 'lucide-react';

interface QuickActionsProps {
  onOpenTransactionModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenTransactionModal,
}) => {
  return (
    <div className="quick-actions-card">
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Yang bisa kamu lakukan
      </h4>

      <div className="quick-actions-grid">
        <button
          type="button"
          className="quick-action-btn"
          onClick={onOpenTransactionModal}
        >
          <PlusCircle size={16} color="var(--primary-600)" />
          <span>Tambah Transaksi</span>
        </button>

        <Link to="/wallet" className="quick-action-btn">
          <Wallet size={16} color="#6366f1" />
          <span>Tambah Dompet</span>
        </Link>

        <Link to="/budget" className="quick-action-btn">
          <PieChart size={16} color="#f59e0b" />
          <span>Buat Anggaran</span>
        </Link>

        <Link to="/wallet" className="quick-action-btn">
          <ArrowRightLeft size={16} color="#06b6d4" />
          <span>Transfer Saldo</span>
        </Link>
      </div>
    </div>
  );
};

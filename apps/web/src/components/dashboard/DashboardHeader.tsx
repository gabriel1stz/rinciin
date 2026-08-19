// DashboardHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { getGreeting, formatFullDateId } from '../../utils/date';

interface DashboardHeaderProps {
  userName?: string;
  onOpenTransactionModal: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = 'Pengguna',
  onOpenTransactionModal,
}) => {
  const greeting = getGreeting();
  const todayStr = formatFullDateId(new Date());

  return (
    <div className="dashboard-header-container">
      <div>
        <h1 className="dashboard-greeting-title">
          {greeting}, {userName} 👋
        </h1>
        <p className="dashboard-greeting-subtext">
          Berikut ringkasan kondisi keuangan kamu hari ini.
        </p>
        <div className="dashboard-date-badge">
          <Calendar size={13} />
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="dashboard-header-actions">
        <Link to="/reports">
          <Button variant="outline" size="sm" leftIcon={<BarChart3 size={15} />}>
            Lihat Laporan
          </Button>
        </Link>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={onOpenTransactionModal}
        >
          + Transaksi Baru
        </Button>
      </div>
    </div>
  );
};

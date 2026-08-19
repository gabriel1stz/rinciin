// StatCard.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg = 'var(--primary-50)',
  trend,
  className,
}) => {
  return (
    <div className={cn('stat-card', className)}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && (
          <div className="stat-card-icon" style={{ background: iconBg }}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="stat-card-value">{value}</div>
        {trend && (
          <div
            className="stat-card-trend"
            style={{ color: trend.isPositive ? 'var(--success-text)' : 'var(--danger-text)' }}
          >
            <span>{trend.isPositive ? '↑' : '↓'} {trend.value}</span>
            {trend.label && <span style={{ color: 'var(--text-muted)' }}>{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

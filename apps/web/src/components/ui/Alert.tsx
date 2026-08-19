// Alert.tsx
import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
}) => {
  const icons = {
    info: <Info size={18} color="var(--info-500)" />,
    success: <CheckCircle2 size={18} color="var(--success-500)" />,
    warning: <AlertTriangle size={18} color="var(--warning-500)" />,
    danger: <AlertCircle size={18} color="var(--danger-500)" />,
  };

  const bgStyles = {
    info: { bg: 'var(--info-bg)', border: 'rgba(59, 130, 246, 0.2)' },
    success: { bg: 'var(--success-bg)', border: 'rgba(16, 185, 129, 0.2)' },
    warning: { bg: 'var(--warning-bg)', border: 'rgba(245, 158, 11, 0.2)' },
    danger: { bg: 'var(--danger-bg)', border: 'rgba(239, 68, 68, 0.2)' },
  };

  return (
    <div
      className={cn('flex gap-3 p-4', className)}
      style={{
        background: bgStyles[variant].bg,
        border: `1px solid ${bgStyles[variant].border}`,
        borderRadius: 'var(--radius-xl)',
      }}
      role="alert"
    >
      <div style={{ marginTop: '2px' }}>{icons[variant]}</div>
      <div style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>
        {title && (
          <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>
            {title}
          </div>
        )}
        <div style={{ color: 'var(--text-secondary)' }}>{children}</div>
      </div>
    </div>
  );
};

// ProgressBar.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  value: number; // 0 - 100
  status?: 'SAFE' | 'WARNING' | 'DANGER' | 'EXCEEDED' | 'default';
  height?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  status = 'default',
  height = 8,
  className,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);

  let fillColor = 'var(--primary-500)';
  if (status === 'SAFE') fillColor = 'var(--success-500)';
  if (status === 'WARNING') fillColor = 'var(--warning-500)';
  if (status === 'DANGER' || status === 'EXCEEDED') fillColor = 'var(--danger-500)';

  return (
    <div
      className={cn('budget-progress-bar', className)}
      style={{ height: `${height}px` }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="budget-progress-fill"
        style={{
          width: `${clamped}%`,
          backgroundColor: fillColor,
        }}
      />
    </div>
  );
};

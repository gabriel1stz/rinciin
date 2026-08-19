// Divider.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className }) => {
  if (!label) {
    return (
      <hr
        className={cn('w-full border-0', className)}
        style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: 'var(--space-4) 0' }}
      />
    );
  }

  return (
    <div
      className={cn('flex items-center gap-3 w-full', className)}
      style={{ margin: 'var(--space-4) 0' }}
    >
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
    </div>
  );
};

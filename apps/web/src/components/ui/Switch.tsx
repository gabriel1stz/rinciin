// Switch.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={cn('flex items-center gap-3 cursor-pointer select-none', className)}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: '2.75rem',
          height: '1.5rem',
          backgroundColor: checked ? 'var(--primary-500)' : 'var(--border-strong)',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          transition: 'background-color var(--transition-fast)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '1.25rem',
            height: '1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-full)',
            transform: checked ? 'translateX(1.25rem)' : 'translateX(0)',
            transition: 'transform var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>
      {label && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  );
};

// SearchBox.tsx
import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChangeValue,
  placeholder = 'Cari...',
  className,
  ...props
}) => {
  return (
    <div className={cn('input-with-icon', className)} style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <span className="input-icon-left">
        <Search size={16} />
      </span>
      <input
        type="text"
        className="form-input"
        style={{ paddingRight: value ? '2.25rem' : '0.875rem' }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChangeValue('')}
          style={{
            position: 'absolute',
            right: '0.75rem',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Hapus pencarian"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

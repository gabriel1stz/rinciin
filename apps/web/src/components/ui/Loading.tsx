// Loading.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LoadingProps {
  text?: string;
  size?: number;
  className?: string;
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = 'Memuat data...',
  size = 28,
  className,
  fullPage = false,
}) => {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage ? 'min-h-[60vh]' : 'py-12',
        className
      )}
    >
      <Loader2 className="animate-spin" size={size} color="var(--primary-500)" />
      {text && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{text}</span>}
    </div>
  );

  return content;
};

// Avatar.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const getInitials = (n?: string | null) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: { width: '1.75rem', height: '1.75rem', fontSize: '0.75rem' },
    md: { width: '2.25rem', height: '2.25rem', fontSize: '0.875rem' },
    lg: { width: '3rem', height: '3rem', fontSize: '1.125rem' },
    xl: { width: '4rem', height: '4rem', fontSize: '1.5rem' },
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover', className)}
        style={{ ...sizeStyles[size], borderRadius: 'var(--radius-full)' }}
      />
    );
  }

  return (
    <div
      className={cn('user-avatar', className)}
      style={{ ...sizeStyles[size], borderRadius: 'var(--radius-full)' }}
    >
      {getInitials(name)}
    </div>
  );
};

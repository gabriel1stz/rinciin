// Skeleton.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  className,
  style,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--border-strong)',
        ...style,
      }}
      {...props}
    />
  );
};

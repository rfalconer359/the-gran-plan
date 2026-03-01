import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'px-5 py-4 rounded-xl text-lg font-medium',
        {
          'bg-blue-50 text-blue-800 border border-blue-200': variant === 'info',
          'bg-green-50 text-green-800 border border-green-200': variant === 'success',
          'bg-amber-50 text-amber-800 border border-amber-200': variant === 'warning',
          'bg-red-50 text-red-800 border border-red-200': variant === 'error',
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

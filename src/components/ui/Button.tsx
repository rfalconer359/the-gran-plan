import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-warm-500 text-white hover:bg-warm-600 active:bg-warm-700': variant === 'primary',
          'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700': variant === 'secondary',
          'border-2 border-warm-300 text-warm-700 hover:bg-warm-50 active:bg-warm-100': variant === 'outline',
          'text-warm-600 hover:bg-warm-100 active:bg-warm-200': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700': variant === 'danger',
        },
        {
          'px-4 py-2 text-base min-h-[44px]': size === 'sm',
          'px-6 py-3 text-lg min-h-[48px]': size === 'md',
          'px-8 py-4 text-xl min-h-[56px] w-full': size === 'lg',
        },
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textAreaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textAreaId}
            className="block text-lg font-medium text-warm-800 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          className={cn(
            'w-full px-4 py-3 text-lg rounded-xl border-2 transition-colors min-h-[100px]',
            'bg-white text-warm-900 placeholder:text-warm-400',
            'focus:outline-none focus:border-warm-500 focus:ring-2 focus:ring-warm-200',
            error
              ? 'border-red-400'
              : 'border-warm-200 hover:border-warm-300',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-base text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';

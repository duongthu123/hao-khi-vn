import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-[5px] uppercase';

    const variants = {
      primary: 'bg-[#c0392b] text-white hover:bg-[#e74c3c] focus-visible:ring-[#c0392b] shadow-[0_5px_15px_rgba(0,0,0,0.3)]',
      secondary: 'bg-[#5d4037] text-[#d7ccc8] border-2 border-[#8d6e63] hover:bg-[#4e342e] hover:border-[#ffd700] focus-visible:ring-[#8d6e63]',
      danger: 'bg-[#c0392b] text-white hover:bg-[#e74c3c] focus-visible:ring-[#c0392b]',
      ghost: 'bg-transparent text-[#d7ccc8] hover:bg-white/10 focus-visible:ring-gray-400',
    };

    const sizes = {
      sm: 'min-h-[44px] h-10 px-3 text-sm',
      md: 'min-h-[44px] h-11 px-5 text-base',
      lg: 'min-h-[44px] h-[45px] px-6 text-lg w-[200px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        style={{ fontFamily: "'Oswald', sans-serif" }}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Đang tải...</span>
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

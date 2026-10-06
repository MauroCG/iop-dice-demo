import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'neon' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'neon',
      size = 'md',
      isLoading = false,
      loadingText,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    const variantStyles = {
      neon: 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/25 hover:border-neon-cyan hover:shadow-glow-cyan focus:ring-neon-cyan',
      primary:
        'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg focus:ring-blue-400 border border-blue-500/50',
      secondary:
        'bg-dark-elevated text-slate-200 hover:bg-slate-700/60 border border-slate-700 focus:ring-slate-400',
      outline:
        'bg-transparent text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white focus:ring-slate-400',
      danger:
        'bg-rose-500/15 text-rose-400 border border-rose-500/40 hover:bg-rose-500/25 hover:border-rose-500 hover:shadow-glow-rose focus:ring-rose-500',
      ghost:
        'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 focus:ring-slate-500',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

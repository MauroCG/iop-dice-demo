import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'cyan',
  size = 'sm',
  ...props
}) => {
  const variantStyles = {
    cyan: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
    purple: 'bg-neon-purple/15 text-neon-violet border-neon-purple/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-full border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono tracking-wide',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

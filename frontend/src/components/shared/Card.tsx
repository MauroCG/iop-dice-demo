import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'purple' | 'none';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  bordered = true,
  ...props
}) => {
  const glowStyles = {
    none: '',
    cyan: 'border-neon-cyan/30 shadow-glow-cyan/20',
    purple: 'border-neon-purple/30 shadow-glow-purple/20',
  };

  return (
    <div
      className={cn(
        'bg-dark-surface/90 backdrop-blur-md rounded-2xl p-5',
        bordered && 'border border-slate-800/80',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

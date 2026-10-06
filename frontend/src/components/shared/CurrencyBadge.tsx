import React from 'react';
import { cn } from '../../utils/cn';
import { SUPPORTED_ASSETS } from '../../constants/currencies';

interface CurrencyBadgeProps {
  assetCode?: string;
  size?: 'xs' | 'sm' | 'md';
  showFlag?: boolean;
  className?: string;
}

export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({
  assetCode = 'USD',
  size = 'xs',
  showFlag = false,
  className,
}) => {
  const code = (assetCode || 'USD').toUpperCase();
  const asset = SUPPORTED_ASSETS[code] || {
    code,
    flag: '🌐',
  };

  const colorStyles: Record<string, string> = {
    USD: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40 shadow-glow-cyan/20',
    EUR: 'bg-sky-500/15 text-sky-300 border-sky-400/40 shadow-sky-950/40',
    GBP: 'bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-purple-950/40',
    COP: 'bg-amber-500/15 text-amber-300 border-amber-400/40 shadow-amber-950/40',
    MXN: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-emerald-950/40',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold tracking-wider border',
    sm: 'text-xs px-2 py-0.5 rounded-lg font-mono font-bold tracking-wider border',
    md: 'text-xs px-2.5 py-1 rounded-xl font-mono font-bold tracking-wider border',
  };

  const badgeStyle = colorStyles[code] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 select-none shrink-0',
        sizeStyles[size],
        badgeStyle,
        className
      )}
      title={`Moneda Interledger: ${code}`}
    >
      {showFlag && <span className="text-[11px] leading-none">{asset.flag}</span>}
      <span>{code}</span>
    </span>
  );
};

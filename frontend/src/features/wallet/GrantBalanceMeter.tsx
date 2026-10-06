import React from 'react';
import { Coins, AlertCircle } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { formatUSD } from '../../utils/formatters';
import { COPY } from '../../constants/copy.es';

export const GrantBalanceMeter: React.FC = () => {
  const { grant, isConnected, setIsModalOpen } = useWallet();

  if (!isConnected || !grant) {
    return null;
  }

  const percent = Math.min(100, Math.max(0, (grant.remainingAmount / grant.totalAmount) * 100));
  const isLow = grant.remainingAmount <= 0.30;

  return (
    <div
      onClick={() => setIsModalOpen(true)}
      role="button"
      tabIndex={0}
      title="Clic para gestionar el permiso de micro-pagos"
      className="flex items-center gap-3 bg-dark-surface/90 border border-slate-700/80 hover:border-neon-cyan/50 rounded-xl px-3 py-1.5 cursor-pointer transition-all duration-200 hover:shadow-glow-cyan/20 group"
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-neon-cyan/10 text-neon-cyan group-hover:scale-105 transition-transform">
        <Coins className="w-4 h-4" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400">
            {COPY.header.grantRemaining}
          </span>
          {isLow && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-medium">
              <AlertCircle className="w-2.5 h-2.5" /> Bajo
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-bold text-slate-100 font-mono">
            {formatUSD(grant.remainingAmount)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            / {formatUSD(grant.totalAmount)}
          </span>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isLow ? 'bg-amber-400' : 'bg-neon-cyan shadow-glow-cyan'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

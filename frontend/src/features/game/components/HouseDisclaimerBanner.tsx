import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { COPY } from '../../../constants/copy.es';

export const HouseDisclaimerBanner: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-dark-surface/60 border border-slate-800 text-xs text-slate-400 h-full">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-neon-cyan shrink-0" />
        <div className="flex flex-col">
          <span className="font-bold text-slate-200 text-[11px]">
            {COPY.disclaimer.title}
          </span>
          <span className="text-[10px] text-slate-400">
            {COPY.disclaimer.houseFee} • {COPY.disclaimer.rolloverRule}
          </span>
        </div>
      </div>

      {/* Abandoned room disclaimer badge */}
      <div className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-dark-base border border-amber-500/30 text-amber-300 text-[10px] shrink-0">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{COPY.disclaimer.abandonedRoomRule}</span>
      </div>
    </div>
  );
};

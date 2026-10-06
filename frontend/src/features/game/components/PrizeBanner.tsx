import React from 'react';
import { Sparkles, TrendingUp, Coins } from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { formatUSD } from '../../../utils/formatters';
import { COPY } from '../../../constants/copy.es';

export const PrizeBanner: React.FC = () => {
  const { roundState } = useGame();
  const { roundPool, accumulatedJackpot, totalPrizePool } = roundState;

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
      {/* Round pool */}
      <div className="flex flex-col justify-center p-3 sm:p-3.5 rounded-2xl bg-dark-base/90 border border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
          <Coins className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider truncate">
            {COPY.game.currentRoundPool}
          </span>
        </div>
        <span className="text-sm sm:text-base font-black font-mono text-slate-100">
          {formatUSD(roundPool)}
        </span>
      </div>

      {/* Rollover Jackpot */}
      <div className="flex flex-col justify-center p-3 sm:p-3.5 rounded-2xl bg-dark-base/90 border border-neon-purple/40 bg-neon-purple/5 shadow-glow-purple/10">
        <div className="flex items-center gap-1.5 text-neon-purple mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-neon-purple animate-pulse" />
          <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider truncate">
            {COPY.game.accumulatedJackpot}
          </span>
        </div>
        <span className="text-sm sm:text-base font-black font-mono text-neon-violet">
          {formatUSD(accumulatedJackpot)}
        </span>
      </div>

      {/* Total Prize Pool */}
      <div className="flex flex-col justify-center p-3 sm:p-3.5 rounded-2xl bg-dark-base/90 border border-neon-cyan/50 bg-neon-cyan/10 shadow-glow-cyan/20">
        <div className="flex items-center gap-1.5 text-neon-cyan mb-1">
          <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider truncate">
            {COPY.game.totalPrizePool}
          </span>
        </div>
        <span className="text-base sm:text-xl font-black font-mono text-neon-cyan">
          {formatUSD(totalPrizePool)}
        </span>
      </div>
    </div>
  );
};

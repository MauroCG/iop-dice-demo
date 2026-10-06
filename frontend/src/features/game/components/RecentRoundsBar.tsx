import React from 'react';
import { History } from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { COPY } from '../../../constants/copy.es';

export const RecentRoundsBar: React.FC = () => {
  const { roundState } = useGame();
  const { recentHistory } = roundState;

  if (recentHistory.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 p-3.5 bg-dark-surface/60 border border-slate-800 rounded-2xl">
      <div className="flex items-center gap-2">
        <History className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {COPY.game.recentRoundsTitle}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {recentHistory.map((item, idx) => (
          <div
            key={`${item.roundNumber}_${idx}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-dark-base border border-slate-800 text-xs shrink-0"
          >
            <span className="text-[10px] text-slate-500 font-mono">
              #{item.roundNumber}
            </span>
            <span className="font-mono font-bold text-neon-cyan">
              {item.sum}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({item.diceValues[0]}+{item.diceValues[1]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

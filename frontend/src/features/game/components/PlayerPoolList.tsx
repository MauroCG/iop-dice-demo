import React from 'react';
import { Users } from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { Badge } from '../../../components/shared/Badge';
import { formatUSD, truncatePointer } from '../../../utils/formatters';
import { COPY } from '../../../constants/copy.es';

export const PlayerPoolList: React.FC = () => {
  const { roundState } = useGame();
  const { bets } = roundState;

  return (
    <div className="flex flex-col gap-2.5 p-4 bg-dark-surface/90 border border-slate-800 rounded-2xl backdrop-blur-md h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            {COPY.game.livePlayersTitle}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {bets.length} {bets.length === 1 ? 'apuesta' : 'apuestas'}
        </span>
      </div>

      {/* Bets List */}
      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
        {bets.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            {COPY.game.noBetsYet}
          </div>
        ) : (
          bets.map((bet) => (
            <div
              key={bet.id}
              className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                bet.isLocalPlayer
                  ? 'bg-neon-cyan/15 border-neon-cyan/50 text-white shadow-glow-cyan/20'
                  : 'bg-dark-base/70 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {bet.isLocalPlayer && (
                  <Badge variant="cyan" size="sm">
                    TÚ
                  </Badge>
                )}
                <span className="font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-[150px]">
                  {bet.playerName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                  ({truncatePointer(bet.paymentPointer, 12)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatUSD(bet.amountUSD)}
                </span>
                <Badge variant="purple" size="sm">
                  #{bet.numberGuess}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { VALID_DICE_NUMBERS } from '../../../constants/game';
import { useGame } from '../../../context/GameContext';
import { COPY } from '../../../constants/copy.es';
import { cn } from '../../../utils/cn';

export const NumberGridSelector: React.FC = () => {
  const { roundState, selectedNumber, setSelectedNumber } = useGame();
  const { phase, userBet, bets } = roundState;

  const isBettingLocked = phase !== 'BETTING' || userBet !== null;

  // Count bets per number for visual density indicators
  const betCountPerNumber = bets.reduce<Record<number, number>>((acc, bet) => {
    acc[bet.numberGuess] = (acc[bet.numberGuess] || 0) + 1;
    return acc;
  }, {});

  const handleSelect = (num: number) => {
    if (isBettingLocked) return;
    setSelectedNumber(num);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {COPY.game.pickNumberPrompt}
        </label>
        {userBet ? (
          <span className="text-xs font-mono font-bold text-neon-cyan bg-neon-cyan/15 border border-neon-cyan/40 px-2.5 py-0.5 rounded-full shadow-glow-cyan/20">
            {COPY.game.betPlacedBadge} #{userBet.numberGuess}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            {COPY.game.singleGuessNotice}
          </span>
        )}
      </div>

      {/* Streamlined Clean Grid 2-12 */}
      <div className="grid grid-cols-11 gap-1.5 sm:gap-2">
        {VALID_DICE_NUMBERS.map((num) => {
          const isSelected = selectedNumber === num || (userBet && userBet.numberGuess === num);
          const count = betCountPerNumber[num] || 0;
          const isUserPick = userBet && userBet.numberGuess === num;

          return (
            <button
              key={num}
              type="button"
              disabled={isBettingLocked}
              onClick={() => handleSelect(num)}
              className={cn(
                'relative flex flex-col items-center justify-center h-12 sm:h-14 rounded-xl border transition-all duration-150 select-none group',
                'bg-dark-base/90 hover:bg-dark-elevated',
                isSelected
                  ? 'border-neon-cyan bg-neon-cyan/25 text-white shadow-glow-cyan scale-[1.05] z-10 ring-1 ring-neon-cyan'
                  : 'border-slate-800 text-slate-200 hover:border-slate-600',
                isBettingLocked && !isSelected && 'opacity-35 cursor-not-allowed hover:bg-dark-base',
                isUserPick && 'border-neon-cyan bg-neon-cyan/30'
              )}
            >
              {/* Number display */}
              <span className="text-base sm:text-lg font-black font-mono tracking-tight">
                {num}
              </span>

              {/* Active peer bets badge */}
              {count > 0 && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neon-purple text-[9px] font-bold text-white flex items-center justify-center shadow-md ring-1 ring-dark-base"
                  title={`${count} apuesta(s)`}
                >
                  {count}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Die3D } from './Die3D';
import { useGame } from '../../../context/GameContext';
import { COPY } from '../../../constants/copy.es';

export const DiceContainer: React.FC = () => {
  const { roundState } = useGame();
  const { phase, diceValues, winningNumber } = roundState;

  const isRolling = phase === 'ROLLING';
  const isResolving = phase === 'RESOLVING' || phase === 'SETTLED';

  const die1Value = diceValues ? diceValues[0] : 3;
  const die2Value = diceValues ? diceValues[1] : 4;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-dark-surface/90 border border-slate-800 rounded-2xl backdrop-blur-md overflow-hidden shadow-xl h-full min-h-[170px]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-neon-cyan/5 via-transparent to-transparent pointer-events-none" />

      {/* Status banner */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isRolling
              ? 'bg-amber-400 animate-ping'
              : isResolving
              ? 'bg-neon-cyan shadow-glow-cyan'
              : 'bg-slate-500'
          }`}
        />
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 font-mono">
          {isRolling
            ? COPY.game.phaseRolling
            : isResolving
            ? `${COPY.game.sumResult} ${winningNumber}`
            : COPY.game.phaseBetting}
        </span>
      </div>

      {/* 3D Dice Field Arena */}
      <div className="relative flex items-center justify-center gap-8 py-2 px-4">
        {/* Isometric base shadow */}
        <div className="absolute bottom-1 w-36 h-6 bg-neon-cyan/10 rounded-full blur-md pointer-events-none" />

        <Die3D value={die1Value} isRolling={isRolling} />
        <Die3D value={die2Value} isRolling={isRolling} />
      </div>

      {/* Outcome Pill */}
      <div className="mt-2 flex items-center justify-center min-h-[28px]">
        {isResolving && winningNumber !== null ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan shadow-glow-cyan animate-scaleUp">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-spin" />
            <span className="text-xs font-black font-mono tracking-wider">
              {COPY.game.sumResult} {winningNumber}
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 font-medium">
            {isRolling ? 'Lanzando dados...' : 'Tirada en vivo al terminar el tiempo'}
          </p>
        )}
      </div>
    </div>
  );
};

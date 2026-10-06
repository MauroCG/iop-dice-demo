import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { ROUND_DURATION_SECONDS } from '../../../constants/game';
import { COPY } from '../../../constants/copy.es';

export const GameCountdown: React.FC = () => {
  const { roundState } = useGame();
  const { timeLeftMs, phase, roundNumber } = roundState;

  const seconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const totalMs = ROUND_DURATION_SECONDS * 1000;
  const progressPercent = Math.min(100, Math.max(0, (timeLeftMs / totalMs) * 100));

  // Circular SVG coordinates
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Color transitions based on remaining time
  const isUrgent = seconds <= 5 && seconds > 2;
  const isCritical = seconds <= 2 && seconds > 0;
  const isEnded = seconds === 0 || phase !== 'BETTING';

  const strokeColor = isEnded
    ? 'stroke-slate-700'
    : isCritical
    ? 'stroke-rose-500'
    : isUrgent
    ? 'stroke-amber-400'
    : seconds <= 10
    ? 'stroke-sky-400'
    : 'stroke-neon-cyan';

  const glowShadow = isCritical
    ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]'
    : isUrgent
    ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    : 'drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]';

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-dark-surface/90 border border-slate-800 rounded-3xl backdrop-blur-md">
      {/* Round badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-elevated border border-slate-700 mb-3">
        <Timer className="w-3.5 h-3.5 text-neon-cyan" />
        <span className="text-xs font-mono font-semibold text-slate-200">
          {COPY.game.roundNumber} #{roundNumber}
        </span>
      </div>

      {/* Circular Timer Ring */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Animated Progress Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`transition-all duration-150 ease-linear ${strokeColor} ${glowShadow}`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Digital Display */}
        <div
          className={`absolute flex flex-col items-center justify-center select-none ${
            isCritical ? 'animate-pulse text-rose-400' : ''
          }`}
        >
          <span
            className={`text-3xl font-black font-mono tracking-tighter ${
              isEnded
                ? 'text-slate-500'
                : isCritical
                ? 'text-rose-400'
                : isUrgent
                ? 'text-amber-400'
                : 'text-white'
            }`}
          >
            {phase === 'BETTING' ? `${seconds}s` : '0s'}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
            {phase === 'BETTING' ? 'Tiempo' : phase}
          </span>
        </div>
      </div>

      {/* Urgent Warning Cue */}
      <div className="mt-2 min-h-[20px] flex items-center">
        {isUrgent && (
          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold animate-pulse">
            <AlertTriangle className="w-3 h-3" /> ¡Últimos segundos!
          </span>
        )}
        {isCritical && (
          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-extrabold animate-bounce">
            <AlertTriangle className="w-3 h-3" /> ¡Cerrando apuestas!
          </span>
        )}
      </div>
    </div>
  );
};

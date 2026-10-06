import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { VALID_DICE_NUMBERS, DICE_ODDS_TABLE } from '../../../constants/game';

export const OddsMultiplierTable: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-dark-surface/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium">
          <HelpCircle className="w-4 h-4 text-neon-cyan" />
          Tabla de Probabilidades Matemáticas & Multiplicadores
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-slate-800/80 animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {VALID_DICE_NUMBERS.map((num) => {
              const item = DICE_ODDS_TABLE[num];
              return (
                <div
                  key={num}
                  className="p-2.5 rounded-xl bg-dark-base border border-slate-800 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-200">
                      Suma {num}
                    </span>
                    <span className="font-mono text-neon-cyan font-extrabold">
                      {item.multiplier}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.probabilityPercent}%</span>
                    <span>({item.combinations}/36)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

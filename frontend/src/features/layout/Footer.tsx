import React from 'react';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';
import { COPY } from '../../constants/copy.es';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-dark-base/90 py-5 px-4 sm:px-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Activity className="w-3.5 h-3.5" />
            Red ILP Conectada
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-neon-cyan" />
            Latencia: ~12ms
          </span>
          <span>•</span>
          <span className="hidden sm:inline text-slate-400">
            Micro-pagos automáticos de $0.10 USD
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-neon-cyan" />
          <span>{COPY.disclaimer.houseFee}</span>
        </div>
      </div>
    </footer>
  );
};

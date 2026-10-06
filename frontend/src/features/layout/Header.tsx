import React from 'react';
import { Dices, Wallet, History, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { Button } from '../../components/shared/Button';
import { GrantBalanceMeter } from '../wallet/GrantBalanceMeter';
import { truncatePointer } from '../../utils/formatters';
import { COPY } from '../../constants/copy.es';

export const Header: React.FC = () => {
  const { isConnected, pointer, setIsModalOpen, setIsTxHistoryOpen, isInRoom, leaveRoom } = useWallet();
  const { isMuted, toggleMute } = useAudioFeedback();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-base/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/40 shadow-glow-cyan/20">
            <Dices className="w-5 h-5 text-neon-cyan animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{COPY.header.title}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
                ILP Live
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {COPY.header.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-dark-surface/60 border border-slate-800 hover:border-slate-700 transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            aria-label="Alternar audio"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-neon-cyan" />
            )}
          </button>

          {/* Transaction history button */}
          <button
            type="button"
            onClick={() => setIsTxHistoryOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-dark-surface/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
            title={COPY.header.txHistory}
            aria-label="Ver historial de micro-pagos"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 hidden lg:inline">
              {COPY.header.txHistory}
            </span>
          </button>

          {/* Grant balance meter widget (only if connected) */}
          <GrantBalanceMeter />

          {/* Wallet connect/status button */}
          {isConnected && pointer ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              className="font-mono text-xs border-emerald-500/40 text-emerald-300 hover:border-emerald-400"
            >
              {truncatePointer(pointer, 18)}
            </Button>
          ) : (
            <Button
              variant="neon"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Wallet className="w-4 h-4" />}
            >
              {COPY.header.connectWallet}
            </Button>
          )}

          {/* Leave room button (only visible when inside the room) */}
          {isInRoom && (
            <Button
              variant="outline"
              size="sm"
              onClick={leaveRoom}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
              className="text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/60"
            >
              <span className="hidden sm:inline">{COPY.header.leaveRoom}</span>
              <span className="sm:hidden">Salir</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

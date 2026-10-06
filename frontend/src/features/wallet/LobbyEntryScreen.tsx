import React, { useState } from 'react';
import { Dices, Wallet, ShieldCheck, ArrowRight, Clock, Coins, Sparkles, HelpCircle } from 'lucide-react';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { useWallet } from '../../context/WalletContext';
import { paymentPointerSchema } from '../../schemas/wallet.schema';
import { DEMO_PAYMENT_POINTERS, PRESET_GRANT_AMOUNTS } from '../../constants/wallet';
import { COPY } from '../../constants/copy.es';
import { formatUSD } from '../../utils/formatters';
import { RulesModal } from '../game/components/RulesModal';

export const LobbyEntryScreen: React.FC = () => {
  const {
    pointer: currentPointer,
    isAuthorizing,
    connectWallet,
  } = useWallet();

  const [inputPointer, setInputPointer] = useState(currentPointer || '');
  const [selectedAmount, setSelectedAmount] = useState<number>(5.00);
  const [error, setError] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const handlePointerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPointer(e.target.value);
    if (error) setError(null);
  };

  const handleSelectPresetPointer = (preset: string) => {
    setInputPointer(preset);
    setError(null);
  };

  const handleAuthorizeAndEnter = async () => {
    const trimmed = inputPointer.trim();
    if (!trimmed) {
      setError('Por favor ingresa una dirección de puntero de pago (ej. $ilp.ejemplo/usuario)');
      return;
    }

    const validation = paymentPointerSchema.safeParse(trimmed);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Formato de Puntero de Pago inválido');
      return;
    }

    setError(null);
    await connectWallet(trimmed, selectedAmount);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {/* Hero Header */}
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 flex items-center justify-center shadow-glow-cyan mb-3 animate-pulse-glow">
          <Dices className="w-7 h-7 text-neon-cyan" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> {COPY.lobby.badge}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {COPY.lobby.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-lg leading-relaxed">
          {COPY.lobby.subtitle}
        </p>

        {/* View Rules Modal Button */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dark-surface/80 border border-slate-700 hover:border-neon-cyan text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-neon-cyan" />
            <span>Ver Reglas del Juego y Premios</span>
          </button>
        </div>
      </div>

      {/* Main Entry Card */}
      <div className="w-full max-w-xl bg-dark-surface/90 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl border-t border-t-neon-cyan/30 shadow-glow-cyan/10">
        <div className="flex flex-col gap-5">
          {/* 1. Payment Pointer Input */}
          <div>
            <Input
              label={COPY.lobby.pointerLabel}
              placeholder={COPY.lobby.pointerPlaceholder}
              value={inputPointer}
              onChange={handlePointerChange}
              error={error || undefined}
              leftIcon={<Wallet className="w-4 h-4 text-neon-cyan" />}
            />

            {/* Quick demo presets */}
            <div className="mt-2.5 flex flex-col gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">
                {COPY.lobby.quickFillTitle}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_PAYMENT_POINTERS.map((demo) => (
                  <button
                    key={demo.pointer}
                    type="button"
                    onClick={() => handleSelectPresetPointer(demo.pointer)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      inputPointer === demo.pointer
                        ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan font-semibold shadow-sm'
                        : 'border-slate-800 bg-dark-base text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Amount to Authorize Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">
              {COPY.lobby.grantLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_GRANT_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all text-sm font-mono font-bold ${
                    selectedAmount === amt
                      ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-glow-cyan/30 scale-[1.02]'
                      : 'border-slate-800 bg-dark-base text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  {formatUSD(amt)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {COPY.lobby.grantHelpText}
            </p>
          </div>

          {/* 3. Action button */}
          <Button
            variant="neon"
            size="lg"
            isLoading={isAuthorizing}
            loadingText={COPY.lobby.enteringBtn}
            onClick={handleAuthorizeAndEnter}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full text-base font-bold shadow-glow-cyan py-3.5 mt-1"
          >
            {COPY.lobby.enterBtn}
          </Button>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full text-center">
        <div className="p-2.5 rounded-xl bg-dark-surface/50 border border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
          <span>Rondas de 30s</span>
        </div>
        <div className="p-2.5 rounded-xl bg-dark-surface/50 border border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Coins className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
          <span>Apuestas de $0.10 USD</span>
        </div>
        <div className="p-2.5 rounded-xl bg-dark-surface/50 border border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
          <span>10% Comisión Casa</span>
        </div>
      </div>

      {/* Rules & Prizes Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
};

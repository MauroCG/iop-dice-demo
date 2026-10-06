import React, { useState } from 'react';
import { Dices, Wallet, ShieldCheck, ArrowRight, Clock, Coins, Sparkles, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { useWallet } from '../../context/WalletContext';
import { paymentPointerSchema } from '../../schemas/wallet.schema';
import { DEMO_PAYMENT_POINTERS, PRESET_GRANT_AMOUNTS } from '../../constants/wallet';
import { COPY } from '../../constants/copy.es';
import { formatUSD } from '../../utils/formatters';

export const LobbyEntryScreen: React.FC = () => {
  const {
    pointer: currentPointer,
    grant,
    isConnected,
    isAuthorizing,
    connectWallet,
    enterRoom,
  } = useWallet();

  const [inputPointer, setInputPointer] = useState(
    currentPointer || DEMO_PAYMENT_POINTERS[0].pointer
  );
  const [selectedAmount, setSelectedAmount] = useState<number>(5.00);
  const [error, setError] = useState<string | null>(null);

  const handlePointerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPointer(e.target.value);
    if (error) setError(null);
  };

  const handleAuthorize = async () => {
    const validation = paymentPointerSchema.safeParse(inputPointer);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Puntero de pago inválido');
      return;
    }

    setError(null);
    await connectWallet(inputPointer.trim(), selectedAmount);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {/* Hero Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 flex items-center justify-center shadow-glow-cyan mb-4 animate-pulse-glow">
          <Dices className="w-8 h-8 text-neon-cyan" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> {COPY.lobby.badge}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {COPY.lobby.title}
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
          {COPY.lobby.subtitle}
        </p>
      </div>

      {/* Main Entry Card */}
      <div className="w-full max-w-xl bg-dark-surface/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl border-t border-t-neon-cyan/30 shadow-glow-cyan/10">
        {isConnected && grant && grant.remainingAmount > 0 ? (
          /* Already connected state: Quick Re-entry */
          <div className="flex flex-col gap-6">
            <div className="p-4 rounded-2xl bg-dark-base border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-100">Billetera Conectada</p>
                <p className="text-xs text-emerald-400 font-mono">{grant.pointer}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saldo de permiso disponible:{' '}
                  <strong className="text-slate-100">{formatUSD(grant.remainingAmount)}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="neon"
              size="lg"
              onClick={enterRoom}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full text-base font-bold shadow-glow-cyan py-4"
            >
              Reingresar a la Sala de Juego
            </Button>
          </div>
        ) : (
          /* Wallet Connection & Grant Form */
          <div className="flex flex-col gap-6">
            {/* Payment Pointer Input */}
            <div>
              <Input
                label={COPY.lobby.pointerLabel}
                placeholder={COPY.lobby.pointerPlaceholder}
                value={inputPointer}
                onChange={handlePointerChange}
                error={error || undefined}
                leftIcon={<Wallet className="w-4 h-4" />}
              />

              {/* Demo pointers */}
              <div className="mt-2.5 flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">
                  {COPY.lobby.quickFillTitle}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DEMO_PAYMENT_POINTERS.map((demo) => (
                    <button
                      key={demo.pointer}
                      type="button"
                      onClick={() => {
                        setInputPointer(demo.pointer);
                        setError(null);
                      }}
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

            {/* Grant Allowance Selector */}
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
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all text-sm font-mono font-bold ${
                      selectedAmount === amt
                        ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-glow-cyan/30 scale-[1.02]'
                        : 'border-slate-800 bg-dark-base text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {formatUSD(amt)}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {COPY.lobby.grantHelpText}
              </p>
            </div>

            {/* Quick Rules Preview */}
            <div className="p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800 flex flex-col gap-1.5 text-xs text-slate-400">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neon-cyan" /> Reglas de la Sala
              </span>
              <ul className="flex flex-col gap-1 text-[11px] list-disc list-inside text-slate-400">
                <li>{COPY.lobby.rule1}</li>
                <li>{COPY.lobby.rule2}</li>
                <li>{COPY.lobby.rule3}</li>
                <li>{COPY.lobby.rule5}</li>
              </ul>
            </div>

            {/* Action button */}
            <Button
              variant="neon"
              size="lg"
              isLoading={isAuthorizing}
              loadingText={COPY.lobby.enteringBtn}
              onClick={handleAuthorize}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full text-base font-bold shadow-glow-cyan py-4"
            >
              {COPY.lobby.enterBtn}
            </Button>
          </div>
        )}
      </div>

      {/* Feature Pills */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full text-center">
        <div className="p-3 rounded-2xl bg-dark-surface/50 border border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-neon-cyan shrink-0" />
          <span>Rondas de 30 segundos</span>
        </div>
        <div className="p-3 rounded-2xl bg-dark-surface/50 border border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Coins className="w-4 h-4 text-neon-cyan shrink-0" />
          <span>Micro-apuestas $0.10 USD</span>
        </div>
        <div className="p-3 rounded-2xl bg-dark-surface/50 border border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-neon-cyan shrink-0" />
          <span>10% Comisión Casa</span>
        </div>
      </div>
    </div>
  );
};

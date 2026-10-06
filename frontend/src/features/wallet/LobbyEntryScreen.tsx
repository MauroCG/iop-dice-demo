import React, { useState, useEffect } from 'react';
import { Dices, Wallet, ArrowRight, Clock, Coins, Sparkles, HelpCircle } from 'lucide-react';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { CurrencyBadge } from '../../components/shared/CurrencyBadge';
import { useWallet } from '../../context/WalletContext';
import { paymentPointerSchema } from '../../schemas/wallet.schema';
import { COPY } from '../../constants/copy.es';
import { formatAssetAmount } from '../../utils/formatters';
import { RulesModal } from '../game/components/RulesModal';
import type { WalletAddressResolved } from '../../types/currency';

export const LobbyEntryScreen: React.FC = () => {
  const {
    pointer: currentPointer,
    grant,
    isAuthorizing,
    connectWallet,
    resolveWallet,
    enterRoom,
  } = useWallet();

  const [inputPointer, setInputPointer] = useState(
    currentPointer || ''
  );
  const [resolvedWallet, setResolvedWallet] = useState<WalletAddressResolved>({
    id: 'https://ilp.interledger-test.dev',
    pointer: '$ilp.interledger-test.dev',
    assetCode: 'USD',
    assetScale: 2,
  });
  const [presetAmounts, setPresetAmounts] = useState<number[]>([1.0, 2.0, 5.0, 10.0]);
  const [selectedAmount, setSelectedAmount] = useState<number>(5.0);
  const [error, setError] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Dynamic resolution when pointer changes
  useEffect(() => {
    let isCancelled = false;
    const trimmed = inputPointer.trim();
    if (!trimmed || trimmed.length < 5 || trimmed.includes('\n') || trimmed.includes(' ') || trimmed.length > 150) return;

    // Resolve dynamically via Open Payments endpoint
    resolveWallet(trimmed).then((res) => {
      if (!isCancelled && res) {
        setResolvedWallet(res);
        if (res.assetCode === 'COP') {
          setPresetAmounts([5000, 10000, 20000, 50000]);
          setSelectedAmount(20000);
        } else if (res.assetCode === 'MXN') {
          setPresetAmounts([20, 50, 100, 200]);
          setSelectedAmount(100);
        } else {
          setPresetAmounts([1.0, 2.0, 5.0, 10.0]);
          setSelectedAmount(5.0);
        }
      }
    }).catch(() => {
      // Ignorar errores transitorios de tipeo
    });

    return () => {
      isCancelled = true;
    };
  }, [inputPointer, resolveWallet]);

  const handlePointerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPointer(e.target.value);
    if (error) setError(null);
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
    await connectWallet(resolvedWallet, selectedAmount);
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
          Mesa multi-moneda con liquidación instantánea vía Interledger Protocol (ILP).
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
          {/* Active Session Quick Re-entry */}
          {grant && grant.remainingAmount > 0 && grant.expiresAt > Date.now() && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-glow-cyan/5">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-emerald-400">Sesión Activa Guardada</span>
                <span className="text-xs text-white font-mono font-medium truncate max-w-[240px]">
                  {grant.pointer}
                </span>
                <span className="text-[10px] text-slate-400">
                  Saldo: {formatAssetAmount(grant.remainingAmount, grant.assetCode, grant.assetScale)} ({grant.assetCode})
                </span>
              </div>
              <Button
                variant="neon"
                size="sm"
                onClick={enterRoom}
                className="shrink-0 text-xs py-2 px-3 shadow-glow-cyan"
              >
                Reingresar <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {/* 1. Payment Pointer Input with Dynamic Currency Badge */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {COPY.lobby.pointerLabel}
              </label>
              {resolvedWallet && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Moneda detectada:</span>
                  <CurrencyBadge assetCode={resolvedWallet.assetCode} size="xs" showFlag />
                </div>
              )}
            </div>

            <Input
              placeholder={COPY.lobby.pointerPlaceholder}
              value={inputPointer}
              onChange={handlePointerChange}
              error={error || undefined}
              leftIcon={<Wallet className="w-4 h-4 text-neon-cyan" />}
            />

            {/* Real Rafiki Testnet Explanation */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Ingresa tu Payment Pointer de la <strong className="text-slate-200">Testnet de Rafiki</strong> (ej.{' '}
                <code className="text-neon-cyan font-mono bg-neon-cyan/10 px-1 py-0.5 rounded">$ilp.interledger-test.dev/tu_usuario</code>).
                Al autorizar, serás redirigido a la interfaz de Rafiki para otorgar tu consentimiento seguro vía GNAP.
              </div>
            </div>
          </div>

          {/* 2. Amount to Authorize Selector in Resolved Native Currency */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                {COPY.lobby.grantLabel}
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                en {resolvedWallet.assetCode}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all text-xs sm:text-sm font-mono font-bold truncate ${
                    selectedAmount === amt
                      ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-glow-cyan/30 scale-[1.02]'
                      : 'border-slate-800 bg-dark-base text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  {formatAssetAmount(amt, resolvedWallet.assetCode, resolvedWallet.assetScale)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Cada tirada descontará el equivalente de $0.10 USD en tu moneda nativa ({resolvedWallet.assetCode}).
            </p>
          </div>

          {/* 3. Action Button */}
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
          <Sparkles className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
          <span>Cross-Currency STREAM</span>
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

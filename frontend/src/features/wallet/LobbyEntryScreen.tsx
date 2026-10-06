import React, { useState, useEffect } from 'react';
import { Dices, Wallet, ArrowRight, Clock, Coins, Sparkles, HelpCircle } from 'lucide-react';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { CurrencyBadge } from '../../components/shared/CurrencyBadge';
import { useWallet } from '../../context/WalletContext';
import { paymentPointerSchema } from '../../schemas/wallet.schema';
import { MULTI_ASSET_DEMO_WALLETS } from '../../constants/currencies';
import { COPY } from '../../constants/copy.es';
import { formatAssetAmount } from '../../utils/formatters';
import { RulesModal } from '../game/components/RulesModal';
import type { WalletAddressResolved } from '../../types/currency';

export const LobbyEntryScreen: React.FC = () => {
  const {
    pointer: currentPointer,
    isAuthorizing,
    connectWallet,
    resolveWallet,
  } = useWallet();

  const [inputPointer, setInputPointer] = useState(
    currentPointer || MULTI_ASSET_DEMO_WALLETS[0].pointer
  );
  const [resolvedWallet, setResolvedWallet] = useState<WalletAddressResolved>(
    MULTI_ASSET_DEMO_WALLETS[0].resolved
  );
  const [presetAmounts, setPresetAmounts] = useState<number[]>(
    MULTI_ASSET_DEMO_WALLETS[0].presetGrants
  );
  const [selectedAmount, setSelectedAmount] = useState<number>(
    MULTI_ASSET_DEMO_WALLETS[0].defaultGrant
  );
  const [error, setError] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Dynamic resolution when pointer changes
  useEffect(() => {
    let isCancelled = false;
    const trimmed = inputPointer.trim();
    if (!trimmed) return;

    // Check if matches known demo preset
    const match = MULTI_ASSET_DEMO_WALLETS.find(
      (w) => w.pointer.toLowerCase() === trimmed.toLowerCase()
    );
    if (match) {
      setResolvedWallet(match.resolved);
      setPresetAmounts(match.presetGrants);
      setSelectedAmount(match.defaultGrant);
      return;
    }

    // Otherwise resolve dynamically via mock Open Payments endpoint
    resolveWallet(trimmed).then((res) => {
      if (!isCancelled) {
        setResolvedWallet(res);
        if (res.assetCode === 'COP') {
          setPresetAmounts([5000, 10000, 20000, 50000]);
          setSelectedAmount(20000);
        } else if (res.assetCode === 'MXN') {
          setPresetAmounts([20, 50, 100, 200]);
          setSelectedAmount(100);
        } else {
          setPresetAmounts([1.0, 3.0, 5.0, 10.0]);
          setSelectedAmount(5.0);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [inputPointer, resolveWallet]);

  const handlePointerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPointer(e.target.value);
    if (error) setError(null);
  };

  const handleSelectPreset = (preset: typeof MULTI_ASSET_DEMO_WALLETS[0]) => {
    setInputPointer(preset.pointer);
    setResolvedWallet(preset.resolved);
    setPresetAmounts(preset.presetGrants);
    setSelectedAmount(preset.defaultGrant);
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

            {/* Multi-Asset Test Wallet Presets */}
            <div className="mt-2.5 flex flex-col gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">
                Punteros multi-moneda de demostración:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MULTI_ASSET_DEMO_WALLETS.map((demo) => (
                  <button
                    key={demo.pointer}
                    type="button"
                    onClick={() => handleSelectPreset(demo)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                      inputPointer === demo.pointer
                        ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan font-semibold shadow-sm'
                        : 'border-slate-800 bg-dark-base text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{demo.label}</span>
                    <CurrencyBadge assetCode={demo.resolved.assetCode} size="xs" />
                  </button>
                ))}
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

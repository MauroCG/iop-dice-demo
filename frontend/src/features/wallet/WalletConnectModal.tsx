import React, { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { CurrencyBadge } from '../../components/shared/CurrencyBadge';
import { useWallet } from '../../context/WalletContext';
import { paymentPointerSchema } from '../../schemas/wallet.schema';
import { MULTI_ASSET_DEMO_WALLETS } from '../../constants/currencies';
import { COPY } from '../../constants/copy.es';
import { formatAssetAmount } from '../../utils/formatters';
import type { WalletAddressResolved } from '../../types/currency';

export const WalletConnectModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    pointer: currentPointer,
    grant,
    isConnected,
    isAuthorizing,
    connectWallet,
    disconnectWallet,
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

  useEffect(() => {
    let isCancelled = false;
    const trimmed = inputPointer.trim();
    if (!trimmed) return;

    const match = MULTI_ASSET_DEMO_WALLETS.find(
      (w) => w.pointer.toLowerCase() === trimmed.toLowerCase()
    );
    if (match) {
      setResolvedWallet(match.resolved);
      setPresetAmounts(match.presetGrants);
      setSelectedAmount(match.defaultGrant);
      return;
    }

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

  const handleAuthorize = async () => {
    const trimmed = inputPointer.trim();
    const validation = paymentPointerSchema.safeParse(trimmed);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Puntero de pago inválido');
      return;
    }

    setError(null);
    await connectWallet(resolvedWallet, selectedAmount);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={COPY.walletModal.title}
      subtitle={COPY.walletModal.subtitle}
      maxWidth="md"
    >
      <div className="flex flex-col gap-5 pt-1">
        {/* If already connected, show current status and option to renew or disconnect */}
        {isConnected && grant && (
          <div className="p-3.5 bg-dark-base/80 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-slate-300 font-medium">Billetera conectada</p>
                  <CurrencyBadge assetCode={grant.assetCode} size="xs" showFlag />
                </div>
                <p className="text-xs text-emerald-400 font-mono">{grant.pointer}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Saldo restante:{' '}
                  <strong className="text-slate-100">
                    {formatAssetAmount(grant.remainingAmount, grant.assetCode, grant.assetScale)}
                  </strong>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
              className="text-xs hover:border-rose-500/50 hover:text-rose-300"
            >
              Desconectar
            </Button>
          </div>
        )}

        {/* Input Pointer */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">
              {COPY.walletModal.pointerLabel}
            </label>
            {resolvedWallet && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Activo:</span>
                <CurrencyBadge assetCode={resolvedWallet.assetCode} size="xs" showFlag />
              </div>
            )}
          </div>
          <Input
            placeholder={COPY.walletModal.pointerPlaceholder}
            value={inputPointer}
            onChange={handlePointerChange}
            error={error || undefined}
            leftIcon={<Wallet className="w-4 h-4 text-neon-cyan" />}
          />

          {/* Quick presets */}
          <div className="mt-2 flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">
              {COPY.walletModal.quickFillTitle}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MULTI_ASSET_DEMO_WALLETS.map((demo) => (
                <button
                  key={demo.pointer}
                  type="button"
                  onClick={() => handleSelectPreset(demo)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    inputPointer === demo.pointer
                      ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan font-semibold'
                      : 'border-slate-800 bg-dark-base text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{demo.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grant Allowance Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              {COPY.walletModal.grantLimitLabel}
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
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs font-mono font-bold truncate ${
                  selectedAmount === amt
                    ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-glow-cyan/40 scale-[1.02]'
                    : 'border-slate-800 bg-dark-base text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {formatAssetAmount(amt, resolvedWallet.assetCode, resolvedWallet.assetScale)}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-1.5 mt-1 p-2.5 rounded-lg bg-dark-base/50 border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cada tirada descontará automáticamente el equivalente a $0.10 USD en tu moneda nativa.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setIsModalOpen(false)}
          >
            {COPY.walletModal.cancelBtn}
          </Button>
          <Button
            variant="neon"
            size="md"
            isLoading={isAuthorizing}
            loadingText={COPY.walletModal.authorizing}
            onClick={handleAuthorize}
          >
            {COPY.walletModal.authorizeBtn}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

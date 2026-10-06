import React, { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { CurrencyBadge } from '../../components/shared/CurrencyBadge';
import { useWallet } from '../../context/WalletContext';
import { paymentPointerSchema } from '../../schemas/wallet.schema';
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

  useEffect(() => {
    let isCancelled = false;
    const trimmed = inputPointer.trim();
    if (!trimmed || trimmed.length < 5) return;

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
    }).catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [inputPointer, resolveWallet]);

  const handlePointerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPointer(e.target.value);
    if (error) setError(null);
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

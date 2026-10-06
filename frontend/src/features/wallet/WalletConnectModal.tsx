import React, { useState } from 'react';
import { Wallet, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { useWallet } from '../../context/WalletContext';
import { paymentPointerSchema } from '../../schemas/wallet.schema';
import { DEMO_PAYMENT_POINTERS, PRESET_GRANT_AMOUNTS } from '../../constants/wallet';
import { COPY } from '../../constants/copy.es';
import { formatUSD } from '../../utils/formatters';

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
  } = useWallet();

  const [inputPointer, setInputPointer] = useState(
    currentPointer || DEMO_PAYMENT_POINTERS[0].pointer
  );
  const [selectedAmount, setSelectedAmount] = useState<number>(5.00);
  const [error, setError] = useState<string | null>(null);

  const handlePointerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputPointer(val);
    if (error) setError(null);
  };

  const handleSelectPresetPointer = (preset: string) => {
    setInputPointer(preset);
    setError(null);
  };

  const handleAuthorize = async () => {
    // Validate with Zod
    const validation = paymentPointerSchema.safeParse(inputPointer);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Puntero de pago inválido');
      return;
    }

    setError(null);
    await connectWallet(inputPointer.trim(), selectedAmount);
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
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-300 font-medium">Billetera conectada</p>
                <p className="text-xs text-emerald-400 font-mono">{grant.pointer}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Saldo restante: <strong className="text-slate-100">{formatUSD(grant.remainingAmount)}</strong>
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
          <Input
            label={COPY.walletModal.pointerLabel}
            placeholder={COPY.walletModal.pointerPlaceholder}
            value={inputPointer}
            onChange={handlePointerChange}
            error={error || undefined}
            leftIcon={<Wallet className="w-4 h-4" />}
          />

          {/* Quick presets */}
          <div className="mt-2 flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">
              {COPY.walletModal.quickFillTitle}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_PAYMENT_POINTERS.map((demo) => (
                <button
                  key={demo.pointer}
                  type="button"
                  onClick={() => handleSelectPresetPointer(demo.pointer)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    inputPointer === demo.pointer
                      ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan font-semibold'
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
          <label className="text-xs font-medium text-slate-300">
            {COPY.walletModal.grantLimitLabel}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_GRANT_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedAmount(amt)}
                className={`py-2 px-3 rounded-xl border text-center transition-all text-sm font-mono font-bold ${
                  selectedAmount === amt
                    ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-glow-cyan/40 scale-[1.02]'
                    : 'border-slate-800 bg-dark-base text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {formatUSD(amt)}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-1.5 mt-1 p-2.5 rounded-lg bg-dark-base/50 border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {COPY.walletModal.grantHelpText}
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

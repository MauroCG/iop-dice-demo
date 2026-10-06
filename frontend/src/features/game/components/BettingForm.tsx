import React from 'react';
import { Coins, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { useGame } from '../../../context/GameContext';
import { useWallet } from '../../../context/WalletContext';
import { CurrencyExchangeVisualizer } from './CurrencyExchangeVisualizer';
import { formatAssetAmount, convertUSDToNative } from '../../../utils/formatters';
import { CurrencyBadge } from '../../../components/shared/CurrencyBadge';
import { COPY } from '../../../constants/copy.es';

export const BettingForm: React.FC = () => {
  const { roundState, selectedNumber, isSubmittingBet, submitBet } = useGame();
  const { isConnected, setIsModalOpen, grant } = useWallet();
  const { phase, userBet, timeLeftMs } = roundState;

  const seconds = Math.ceil(timeLeftMs / 1000);
  const isTimeExpiring = seconds <= 1;
  const isRolling = phase !== 'BETTING';

  const assetCode = grant?.assetCode || 'USD';
  const assetScale = grant?.assetScale ?? 2;
  const nativeBetAmount = convertUSDToNative(0.10, assetCode, assetScale);
  const formattedNativeBet = formatAssetAmount(nativeBetAmount, assetCode, assetScale);

  if (!isConnected) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <Coins className="w-4 h-4 text-neon-cyan" />
          <div>
            <p className="text-xs font-semibold text-slate-200">
              {COPY.game.connectToBet}
            </p>
            <p className="text-[11px] text-slate-400">
              {COPY.game.fixedBetNotice}
            </p>
          </div>
        </div>
        <Button
          variant="neon"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto"
        >
          {COPY.header.connectWallet}
        </Button>
      </div>
    );
  }

  if (userBet) {
    return (
      <div className="flex flex-col gap-2">
        <CurrencyExchangeVisualizer />
        <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-base/80 border border-emerald-500/40">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold text-slate-100">
                  {COPY.game.betPlacedBadge} #{userBet.numberGuess}
                </p>
                <CurrencyBadge assetCode={userBet.assetCode} size="xs" showFlag />
              </div>
              <p className="text-[11px] text-emerald-400 font-mono">
                Micro-pago de {formatAssetAmount(userBet.nativeAmount, userBet.assetCode, userBet.assetScale)} ($0.10 USD) confirmado • Ronda #{roundState.roundNumber}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Lock className="w-3.5 h-3.5" /> 1 apuesta por ronda
          </span>
        </div>
      </div>
    );
  }

  const isButtonDisabled =
    !selectedNumber || isRolling || isTimeExpiring || isSubmittingBet;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Automated ILP Exchange Visualizer */}
      <CurrencyExchangeVisualizer />

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm font-bold text-slate-100">
                {selectedNumber
                  ? `Predicción: Número ${selectedNumber}`
                  : 'Selecciona un número del 2 al 12'}
              </p>
              <CurrencyBadge assetCode={assetCode} size="xs" showFlag />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Apuesta fija: {formattedNativeBet} ($0.10 USD)
            </p>
          </div>
        </div>

        <Button
          variant="neon"
          size="md"
          disabled={isButtonDisabled}
          isLoading={isSubmittingBet}
          loadingText={COPY.game.authorizingBet}
          onClick={submitBet}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isRolling
            ? 'Tirada en curso'
            : isTimeExpiring
            ? 'Tiempo agotado'
            : selectedNumber
            ? `Apostar ${formattedNativeBet} (#${selectedNumber})`
            : 'Elige un número'}
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { Coins, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { useGame } from '../../../context/GameContext';
import { useWallet } from '../../../context/WalletContext';
import { COPY } from '../../../constants/copy.es';

export const BettingForm: React.FC = () => {
  const { roundState, selectedNumber, isSubmittingBet, submitBet } = useGame();
  const { isConnected, setIsModalOpen } = useWallet();
  const { phase, userBet, timeLeftMs } = roundState;

  const seconds = Math.ceil(timeLeftMs / 1000);
  const isTimeExpiring = seconds <= 1;
  const isRolling = phase !== 'BETTING';

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
      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-dark-base/80 border border-emerald-500/40">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-100">
              {COPY.game.betPlacedBadge} #{userBet.numberGuess}
            </p>
            <p className="text-[11px] text-emerald-400 font-mono">
              Micro-pago de $0.10 USD confirmado • Ronda #{roundState.roundNumber}
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <Lock className="w-3.5 h-3.5" /> 1 apuesta por ronda
        </span>
      </div>
    );
  }

  const isButtonDisabled =
    !selectedNumber || isRolling || isTimeExpiring || isSubmittingBet;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shrink-0">
          <Coins className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-100">
            {selectedNumber
              ? `Predicción: Número ${selectedNumber}`
              : 'Selecciona un número del 2 al 12'}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            {COPY.game.fixedBetNotice}
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
        className="w-full sm:w-auto min-w-[190px]"
      >
        {isRolling
          ? 'Tirada en curso'
          : isTimeExpiring
          ? 'Tiempo agotado'
          : selectedNumber
          ? `${COPY.game.placeBetBtn} (#${selectedNumber})`
          : 'Elige un número'}
      </Button>
    </div>
  );
};

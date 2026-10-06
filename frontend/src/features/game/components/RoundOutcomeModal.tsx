import React from 'react';
import { Sparkles, Trophy, TrendingUp, ShieldCheck } from 'lucide-react';
import { Modal } from '../../../components/shared/Modal';
import { Button } from '../../../components/shared/Button';
import { CurrencyBadge } from '../../../components/shared/CurrencyBadge';
import { useGame } from '../../../context/GameContext';
import { useWallet } from '../../../context/WalletContext';
import { formatUSD, formatAssetAmount, convertUSDToNative, truncatePointer } from '../../../utils/formatters';
import { COPY } from '../../../constants/copy.es';

export const RoundOutcomeModal: React.FC = () => {
  const { isOutcomeModalOpen, setIsOutcomeModalOpen, roundState } = useGame();
  const { grant } = useWallet();
  const { outcome, userBet } = roundState;

  if (!outcome) return null;

  const isUserWinner = userBet && userBet.numberGuess === outcome.winningNumber;
  const hasWinners = outcome.winners.length > 0;

  const userAssetCode = grant?.assetCode || 'USD';
  const userAssetScale = grant?.assetScale ?? 2;
  const nativeUserPayout = convertUSDToNative(outcome.payoutPerWinner, userAssetCode, userAssetScale);

  return (
    <Modal
      isOpen={isOutcomeModalOpen}
      onClose={() => setIsOutcomeModalOpen(false)}
      title={`Resultado de la Ronda #${roundState.roundNumber}`}
      maxWidth="md"
    >
      <div className="flex flex-col gap-5 pt-1">
        {/* Outcome Header Banner */}
        <div
          className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-1.5 ${
            isUserWinner
              ? 'bg-neon-cyan/15 border-neon-cyan shadow-glow-cyan/40'
              : hasWinners
              ? 'bg-dark-base border-slate-700'
              : 'bg-neon-purple/15 border-neon-purple/50 shadow-glow-purple/20'
          }`}
        >
          {isUserWinner ? (
            <>
              <Trophy className="w-10 h-10 text-neon-cyan animate-bounce mb-1" />
              <h3 className="text-lg font-black text-white">
                {COPY.outcomes.victoryTitle}
              </h3>
              <p className="text-xs text-neon-cyan font-medium">
                {COPY.outcomes.victorySubtitle}
              </p>
            </>
          ) : hasWinners ? (
            <>
              <Sparkles className="w-8 h-8 text-amber-400 mb-1" />
              <h3 className="text-base font-bold text-slate-100">
                ¡Ronda Finalizada!
              </h3>
              <p className="text-xs text-slate-400">
                {outcome.winners.length} jugador(es) acertaron el número ganador.
              </p>
            </>
          ) : (
            <>
              <TrendingUp className="w-8 h-8 text-neon-purple mb-1 animate-pulse" />
              <h3 className="text-base font-extrabold text-neon-violet">
                {COPY.outcomes.noWinnersTitle}
              </h3>
              <p className="text-xs text-slate-300">
                {COPY.outcomes.noWinnersSubtitle}
              </p>
            </>
          )}
        </div>

        {/* Dice Outcome Highlight */}
        <div className="flex items-center justify-center gap-4 p-3.5 rounded-2xl bg-dark-base border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-slate-300">
              [{outcome.diceValues[0]}] + [{outcome.diceValues[1]}]
            </span>
            <span className="text-slate-500 font-bold">=</span>
            <span className="text-3xl font-mono font-black text-neon-cyan">
              {outcome.winningNumber}
            </span>
          </div>
        </div>

        {/* Financial Breakdown (with 10% House Fee) */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-dark-base/80 border border-slate-800 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>{COPY.outcomes.grossPool}</span>
            <span className="font-mono text-slate-200 font-bold">
              {formatUSD(outcome.totalGrossPool)}
            </span>
          </div>

          {hasWinners ? (
            <>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neon-cyan" />
                  {COPY.outcomes.houseTake}
                </span>
                <span className="font-mono text-rose-400">
                  -{formatUSD(outcome.houseFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800 font-semibold">
                <span>{COPY.outcomes.netPrize}</span>
                <span className="font-mono text-emerald-400">
                  {formatUSD(outcome.netPrizePool)}
                </span>
              </div>

              {isUserWinner && (
                <div className="flex justify-between text-neon-cyan pt-1 font-bold items-center">
                  <span>{COPY.outcomes.yourShare}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-base font-black">
                      +{formatAssetAmount(nativeUserPayout, userAssetCode, userAssetScale)}
                    </span>
                    <span className="text-xs text-slate-400">
                      (+{formatUSD(outcome.payoutPerWinner)})
                    </span>
                    <CurrencyBadge assetCode={userAssetCode} size="xs" showFlag />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between text-neon-purple pt-1 border-t border-slate-800 font-bold">
              <span>Acumulado al Jackpot para Ronda Siguiente:</span>
              <span className="font-mono text-sm">
                +{formatUSD(outcome.accumulatedJackpot)}
              </span>
            </div>
          )}
        </div>

        {/* Winners List with Currency Badges */}
        {hasWinners && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-300">
              {COPY.outcomes.winnersList} ({outcome.winners.length})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {outcome.winners.map((w) => (
                <div
                  key={w.id}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1.5 ${
                    w.isLocalPlayer
                      ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan font-bold'
                      : 'bg-dark-base border-slate-800 text-slate-300'
                  }`}
                >
                  <CurrencyBadge assetCode={w.assetCode} size="xs" showFlag />
                  <span>{w.playerName}</span>
                  <span className="text-[10px] text-slate-500">
                    ({truncatePointer(w.paymentPointer, 12)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dismiss Button */}
        <Button
          variant="neon"
          size="md"
          onClick={() => setIsOutcomeModalOpen(false)}
          className="w-full mt-1"
        >
          {COPY.outcomes.closeBtn}
        </Button>
      </div>
    </Modal>
  );
};

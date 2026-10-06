import { toBaseUnits, fromBaseUnits, calculateHouseCut, splitPoolEqually } from '../utils/currencyMath.js';

/**
 * Calculates payouts, house fee, and jackpot rollover for a round using scale-agnostic BigInt arithmetic.
 *
 * @param {number} currentRoundPoolUSD - Sum of bets in the current round ($0.10 per bet)
 * @param {number} accumulatedJackpotUSD - Rollover amount from previous rounds without winners
 * @param {number} winnerCount - Number of matching winners
 * @returns {object} Payout breakdown
 */
export function calculateRoundPayout(currentRoundPoolUSD, accumulatedJackpotUSD, winnerCount) {
  // Scale 2 para USD
  const roundPoolUnits = toBaseUnits(currentRoundPoolUSD, 2);
  const jackpotUnits = toBaseUnits(accumulatedJackpotUSD, 2);

  // Comisión del 10% únicamente sobre las apuestas generadas en la ronda actual
  const { houseFeeBaseUnits, netPoolBaseUnits: roundNetUnits } = calculateHouseCut(roundPoolUnits, 10);

  // Pozo total para repartir = apuestas netas de la ronda + jackpot acumulado
  const totalPrizePoolUnits = roundNetUnits + jackpotUnits;
  const totalGrossPoolUnits = roundPoolUnits + jackpotUnits;

  let payoutPerWinnerUnits = 0n;
  let rolloverUnits = 0n;

  if (winnerCount > 0) {
    const { payoutPerWinnerBaseUnits } = splitPoolEqually(totalPrizePoolUnits, winnerCount);
    payoutPerWinnerUnits = payoutPerWinnerBaseUnits;
    rolloverUnits = 0n; // Se reinicia el pozo al haber ganadores
  } else {
    // Cero ganadores: 100% del pozo disponible se acumula para la siguiente ronda
    payoutPerWinnerUnits = 0n;
    rolloverUnits = totalPrizePoolUnits;
  }

  return {
    totalGrossPool: fromBaseUnits(totalGrossPoolUnits, 2),
    roundPool: fromBaseUnits(roundPoolUnits, 2),
    houseFee: fromBaseUnits(houseFeeBaseUnits, 2),
    netPrizePool: fromBaseUnits(totalPrizePoolUnits, 2),
    payoutPerWinner: fromBaseUnits(payoutPerWinnerUnits, 2),
    rolloverToNextRound: fromBaseUnits(rolloverUnits, 2),
  };
}

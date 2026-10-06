import { HOUSE_FEE_PERCENTAGE } from '../constants/game';

export interface PrizeDistribution {
  totalGrossPool: number;
  houseFee: number;
  netPrizePool: number;
  winnerCount: number;
  payoutPerWinner: number;
  rolloverToNextRound: number;
}

export function rollDice(): [number, number] {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return [die1, die2];
}

export function calculateRoundPayout(
  currentRoundBetsPool: number,
  accumulatedJackpot: number,
  matchingWinnerCount: number
): PrizeDistribution {
  const totalGrossPool = Number((currentRoundBetsPool + accumulatedJackpot).toFixed(2));

  if (matchingWinnerCount === 0) {
    // Nadie gana: 0 comisión descontada, 100% se acumula para la siguiente ronda
    return {
      totalGrossPool,
      houseFee: 0,
      netPrizePool: 0,
      winnerCount: 0,
      payoutPerWinner: 0,
      rolloverToNextRound: totalGrossPool,
    };
  }

  // Hay ganadores: la casa retiene exactamente el 10%
  const rawHouseFee = totalGrossPool * HOUSE_FEE_PERCENTAGE;
  const houseFee = Number(rawHouseFee.toFixed(2));
  const netPrizePool = Number((totalGrossPool - houseFee).toFixed(2));
  const payoutPerWinner = Number((netPrizePool / matchingWinnerCount).toFixed(2));

  return {
    totalGrossPool,
    houseFee,
    netPrizePool,
    winnerCount: matchingWinnerCount,
    payoutPerWinner,
    rolloverToNextRound: 0, // El pozo acumulado se reinicia tras repartirse
  };
}

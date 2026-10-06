import { describe, it, expect } from 'vitest';
import { rollDice, calculateRoundPayout } from './dice';

describe('Lógica de Dados y Cálculo de Pozo con Comisión del 10%', () => {
  it('rollDice genera enteros válidos entre 1 y 6 y suma entre 2 y 12', () => {
    for (let i = 0; i < 50; i++) {
      const [d1, d2] = rollDice();
      expect(d1).toBeGreaterThanOrEqual(1);
      expect(d1).toBeLessThanOrEqual(6);
      expect(d2).toBeGreaterThanOrEqual(1);
      expect(d2).toBeLessThanOrEqual(6);
      const sum = d1 + d2;
      expect(sum).toBeGreaterThanOrEqual(2);
      expect(sum).toBeLessThanOrEqual(12);
    }
  });

  it('cuando no hay ganadores (0 aciertos), el 100% del pozo se acumula y la comisión es 0', () => {
    const roundPool = 1.00;
    const accumulatedJackpot = 2.00;
    const payout = calculateRoundPayout(roundPool, accumulatedJackpot, 0);

    expect(payout.totalGrossPool).toBe(3.00);
    expect(payout.houseFee).toBe(0);
    expect(payout.netPrizePool).toBe(0);
    expect(payout.payoutPerWinner).toBe(0);
    expect(payout.rolloverToNextRound).toBe(3.00);
  });

  it('cuando hay 1 ganador, la casa retiene exactamente el 10% y el ganador recibe el 90%', () => {
    const roundPool = 1.00;
    const accumulatedJackpot = 1.00; // Total 2.00
    const payout = calculateRoundPayout(roundPool, accumulatedJackpot, 1);

    expect(payout.totalGrossPool).toBe(2.00);
    expect(payout.houseFee).toBe(0.20); // 10% de 2.00
    expect(payout.netPrizePool).toBe(1.80); // 90% de 2.00
    expect(payout.payoutPerWinner).toBe(1.80);
    expect(payout.rolloverToNextRound).toBe(0); // Jackpot se reinicia
  });

  it('cuando hay múltiples ganadores (ej. 2), el 90% neto se divide equitativamente', () => {
    const roundPool = 5.00;
    const accumulatedJackpot = 5.00; // Total 10.00
    const payout = calculateRoundPayout(roundPool, accumulatedJackpot, 2);

    expect(payout.totalGrossPool).toBe(10.00);
    expect(payout.houseFee).toBe(1.00); // 10%
    expect(payout.netPrizePool).toBe(9.00); // 90%
    expect(payout.payoutPerWinner).toBe(4.50); // 9.00 / 2
    expect(payout.rolloverToNextRound).toBe(0);
  });
});

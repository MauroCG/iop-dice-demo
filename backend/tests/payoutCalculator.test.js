import { describe, it, expect } from 'vitest';
import { calculateRoundPayout } from '../src/game/payoutCalculator.js';

describe('Calculadora de Premios, Comisión de Casa y Rollover', () => {
  it('aplica comisión del 10% y divide equitativamente el 90% restante con 1 ganador', () => {
    // 5 jugadores apostaron $0.10 USD = $0.50 USD pool. Jackpot acumulado previo = 0.
    const result = calculateRoundPayout(0.50, 0.00, 1);

    expect(result.roundPool).toBe(0.50);
    expect(result.houseFee).toBe(0.05); // 10% de $0.50
    expect(result.netPrizePool).toBe(0.45); // 90% de $0.50
    expect(result.payoutPerWinner).toBe(0.45);
    expect(result.rolloverToNextRound).toBe(0.00); // Pozo se reparte, rollover reinicia a 0
  });

  it('divide el pozo neto entre múltiples ganadores', () => {
    // 10 jugadores = $1.00 USD. 2 ganadores.
    const result = calculateRoundPayout(1.00, 0.00, 2);

    expect(result.houseFee).toBe(0.10);
    expect(result.netPrizePool).toBe(0.90);
    expect(result.payoutPerWinner).toBe(0.45);
    expect(result.rolloverToNextRound).toBe(0.00);
  });

  it('transfiere el 100% del pozo neto al jackpot acumulado si hay 0 ganadores', () => {
    // 4 jugadores = $0.40 USD. 0 ganadores.
    const result = calculateRoundPayout(0.40, 0.00, 0);

    expect(result.houseFee).toBe(0.04);
    expect(result.netPrizePool).toBe(0.36);
    expect(result.payoutPerWinner).toBe(0.00);
    expect(result.rolloverToNextRound).toBe(0.36); // 100% del pozo neto pasa al siguiente ciclo
  });

  it('suma el jackpot acumulado previo al pozo neto a repartir', () => {
    // Jackpot previo de $1.20 USD. Ronda actual genera $0.50 USD. 1 ganador.
    const result = calculateRoundPayout(0.50, 1.20, 1);

    expect(result.houseFee).toBe(0.05); // Comisión solo sobre las nuevas apuestas ($0.50)
    expect(result.netPrizePool).toBe(1.65); // $0.45 neto + $1.20 jackpot acumulado
    expect(result.payoutPerWinner).toBe(1.65);
    expect(result.rolloverToNextRound).toBe(0.00);
  });
});

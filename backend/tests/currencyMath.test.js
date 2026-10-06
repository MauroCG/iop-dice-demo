import { describe, it, expect } from 'vitest';
import {
  toBaseUnits,
  fromBaseUnits,
  calculateHouseCut,
  splitPoolEqually,
} from '../src/utils/currencyMath.js';

describe('Aritmética Financiera Scale-Agnostic con BigInt', () => {
  it('convierte montos flotantes y enteros a BigInt con escala correcta', () => {
    // USD (escala 2)
    expect(toBaseUnits(0.10, 2)).toBe(10n);
    expect(toBaseUnits('0.10', 2)).toBe(10n);
    expect(toBaseUnits(5.50, 2)).toBe(550n);

    // COP (escala 0, sin decimales)
    expect(toBaseUnits(420, 0)).toBe(420n);
    expect(toBaseUnits(20000, 0)).toBe(20000n);

    // Reversible
    expect(fromBaseUnits(10n, 2)).toBe(0.10);
    expect(fromBaseUnits(420n, 0)).toBe(420);
  });

  it('calcula la comisión del 10% de la casa con exactitud matemática BigInt', () => {
    // Pozo de $1.00 USD (100n en escala 2)
    const { houseFeeBaseUnits, netPoolBaseUnits } = calculateHouseCut(100n, 10);
    expect(houseFeeBaseUnits).toBe(10n);
    expect(netPoolBaseUnits).toBe(90n);

    // Pozo de $0.50 USD (50n) -> comisión 5n ($0.05 USD), neto 45n ($0.45 USD)
    const res2 = calculateHouseCut(50n, 10);
    expect(res2.houseFeeBaseUnits).toBe(5n);
    expect(res2.netPoolBaseUnits).toBe(45n);

    // Pozo de 0
    const resZero = calculateHouseCut(0n, 10);
    expect(resZero.houseFeeBaseUnits).toBe(0n);
    expect(resZero.netPoolBaseUnits).toBe(0n);
  });

  it('divide el pozo neto equitativamente entre ganadores sin pérdida de enteros', () => {
    // Pozo neto de $0.90 USD (90n) entre 2 ganadores
    const { payoutPerWinnerBaseUnits, remainderBaseUnits } = splitPoolEqually(90n, 2);
    expect(payoutPerWinnerBaseUnits).toBe(45n); // $0.45 cada uno
    expect(remainderBaseUnits).toBe(0n);

    // Pozo neto de $1.00 USD (100n) entre 3 ganadores -> 33n cada uno, 1n residuo
    const res3 = splitPoolEqually(100n, 3);
    expect(res3.payoutPerWinnerBaseUnits).toBe(33n);
    expect(res3.remainderBaseUnits).toBe(1n);
  });
});

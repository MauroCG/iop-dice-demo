import { describe, it, expect } from 'vitest';
import { normalizePaymentPointer, toPaymentPointer } from '../src/utils/ilpUrl.js';

describe('Normalizador y Conversor de Payment Pointers a URLs Open Payments', () => {
  it('convierte punteros con signo de dólar a URLs HTTPS válidas', () => {
    expect(normalizePaymentPointer('$ilp.rafiki.money/alice')).toBe('https://ilp.rafiki.money/alice');
    expect(normalizePaymentPointer('$gatehub.net/eva_eur')).toBe('https://gatehub.net/eva_eur');
    expect(normalizePaymentPointer('$ilp.bancolombia.co/carlos_cop')).toBe('https://ilp.bancolombia.co/carlos_cop');
  });

  it('elimina diagonales al final preservando el recurso exacto', () => {
    expect(normalizePaymentPointer('https://ilp.rafiki.money/alice/')).toBe('https://ilp.rafiki.money/alice');
    expect(normalizePaymentPointer('$ilp.rafiki.money/alice/')).toBe('https://ilp.rafiki.money/alice');
  });

  it('convierte de vuelta URLs HTTPS a formato canónico de Payment Pointer ($)', () => {
    expect(toPaymentPointer('https://ilp.rafiki.money/alice')).toBe('$ilp.rafiki.money/alice');
    expect(toPaymentPointer('$ilp.rafiki.money/alice')).toBe('$ilp.rafiki.money/alice');
  });

  it('arroja error si el puntero no es provisto o es nulo', () => {
    expect(() => normalizePaymentPointer('')).toThrow();
    expect(() => normalizePaymentPointer(null)).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { isValidPaymentPointer, normalizePaymentPointer, pointerToOpenPaymentsUrl } from './ilp';

describe('Utilidades de Punteros de Pago Interledger (ILP)', () => {
  it('valida punteros con formato estándar $host/path', () => {
    expect(isValidPaymentPointer('$ilp.rafiki.money/alice')).toBe(true);
    expect(isValidPaymentPointer('$ilp.gatehub.net/bob')).toBe(true);
    expect(isValidPaymentPointer('$chimoney.io/charlie')).toBe(true);
    expect(isValidPaymentPointer('$wallet.example.com/sub/user')).toBe(true);
  });

  it('rechaza punteros inválidos', () => {
    expect(isValidPaymentPointer('http://no-pointer.com')).toBe(false);
    expect(isValidPaymentPointer('alice@wallet.com')).toBe(false);
    expect(isValidPaymentPointer('')).toBe(false);
    expect(isValidPaymentPointer('$')).toBe(false);
  });

  it('convierte puntero a URL Open Payments', () => {
    expect(pointerToOpenPaymentsUrl('$ilp.rafiki.money/alice')).toBe('https://ilp.rafiki.money/alice');
  });

  it('normaliza URL https a formato puntero $', () => {
    expect(normalizePaymentPointer('https://ilp.rafiki.money/alice')).toBe('$ilp.rafiki.money/alice');
  });
});

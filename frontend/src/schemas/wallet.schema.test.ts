import { describe, it, expect } from 'vitest';
import { paymentPointerSchema, grantRequestSchema } from './wallet.schema';

describe('Esquemas Zod de Billetera y Permisos ILP', () => {
  it('valida paymentPointerSchema correctamente', () => {
    const valid = paymentPointerSchema.safeParse('$ilp.rafiki.money/alice');
    expect(valid.success).toBe(true);

    const invalid = paymentPointerSchema.safeParse('invalido');
    expect(invalid.success).toBe(false);
  });

  it('valida grantRequestSchema con montos positivos válidos', () => {
    const valid = grantRequestSchema.safeParse({
      pointer: '$ilp.rafiki.money/alice',
      amountUSD: 5.00,
    });
    expect(valid.success).toBe(true);

    const invalidNegative = grantRequestSchema.safeParse({
      pointer: '$ilp.rafiki.money/alice',
      amountUSD: -1.00,
    });
    expect(invalidNegative.success).toBe(false);

    const invalidZero = grantRequestSchema.safeParse({
      pointer: '$ilp.rafiki.money/alice',
      amountUSD: 0,
    });
    expect(invalidZero.success).toBe(false);
  });
});

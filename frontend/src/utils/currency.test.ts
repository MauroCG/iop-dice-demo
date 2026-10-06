import { describe, it, expect } from 'vitest';
import {
  formatAssetAmount,
  convertUSDToNative,
  convertNativeToUSD,
} from './formatters';
import { walletApi } from '../services/api/walletApi';

describe('Utilidades de Conversión y Formato Multi-Divisa (ILP)', () => {
  it('formatea montos con el número correcto de decimales según escala del activo', () => {
    // USD (escala 2)
    const usdFormatted = formatAssetAmount(5.5, 'USD', 2);
    expect(usdFormatted).toMatch(/5[.,]50/);

    // COP (escala 0, sin centavos fraccionarios)
    const copFormatted = formatAssetAmount(20000, 'COP', 0);
    expect(copFormatted).toMatch(/20[.,\s]?000/);
    expect(copFormatted).not.toMatch(/[.,]00\b/);

    // EUR (escala 2)
    const eurFormatted = formatAssetAmount(4.75, 'EUR', 2);
    expect(eurFormatted).toMatch(/4[.,]75/);
  });

  it('convierte montos USD a monedas nativas correctamente', () => {
    // 0.10 USD a COP (tasa ~4200 COP/USD -> 420 COP con escala 0)
    const copAmount = convertUSDToNative(0.10, 'COP', 0);
    expect(copAmount).toBe(420);

    // 0.10 USD a EUR (tasa ~0.92 EUR/USD -> 0.09 EUR con escala 2)
    const eurAmount = convertUSDToNative(0.10, 'EUR', 2);
    expect(eurAmount).toBe(0.09);

    // 0.10 USD a USD -> 0.10 USD
    const usdAmount = convertUSDToNative(0.10, 'USD', 2);
    expect(usdAmount).toBe(0.10);
  });

  it('convierte montos nativos de vuelta a USD para el cálculo de pozo común', () => {
    // 420 COP / 4200 = 0.10 USD
    const usdFromCop = convertNativeToUSD(420, 'COP');
    expect(usdFromCop).toBe(0.10);

    // 0.09 EUR / 0.92 ~ 0.10 USD
    const usdFromEur = convertNativeToUSD(0.092, 'EUR');
    expect(usdFromEur).toBe(0.10);
  });

  it('resuelve direcciones de billetera simulando Open Payments walletAddress.get()', async () => {
    const resolvedCop = await walletApi.resolveWalletAddress('$ilp.bancolombia.co/carlos_cop');
    expect(resolvedCop.assetCode).toBe('COP');
    expect(resolvedCop.assetScale).toBe(0);
    expect(resolvedCop.id).toBe('https://ilp.bancolombia.co/carlos_cop');

    const resolvedEur = await walletApi.resolveWalletAddress('$ilp.gatehub.net/eva_eur');
    expect(resolvedEur.assetCode).toBe('EUR');
    expect(resolvedEur.assetScale).toBe(2);

    const resolvedCustom = await walletApi.resolveWalletAddress('$wallet.test/juan');
    expect(resolvedCustom.assetCode).toBe('USD');
    expect(resolvedCustom.assetScale).toBe(2);
  });
});

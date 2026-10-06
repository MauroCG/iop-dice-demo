import { simulateNetworkDelay } from './client';
import type { GrantSession, MicroTransaction } from '../../types/wallet';
import type { WalletAddressResolved } from '../../types/currency';
import { MULTI_ASSET_DEMO_WALLETS, SUPPORTED_ASSETS } from '../../constants/currencies';
import { convertUSDToNative, formatAssetAmount } from '../../utils/formatters';

export const walletApi = {
  // Simula el endpoint backend que llama a @interledger/open-payments: walletAddress.get({ url })
  async resolveWalletAddress(pointer: string): Promise<WalletAddressResolved> {
    await simulateNetworkDelay(200);

    const cleanPointer = pointer.trim();

    // Buscar si coincide con alguno de los presets predefinidos
    const match = MULTI_ASSET_DEMO_WALLETS.find(
      (w) => w.pointer.toLowerCase() === cleanPointer.toLowerCase()
    );
    if (match) {
      return match.resolved;
    }

    // Heurística de detección inteligente para punteros personalizados
    const lower = cleanPointer.toLowerCase();
    let assetCode = 'USD';
    let assetScale = 2;

    if (lower.includes('cop') || lower.endsWith('.co') || lower.includes('bancolombia')) {
      assetCode = 'COP';
      assetScale = 0;
    } else if (lower.includes('eur') || lower.endsWith('.eu')) {
      assetCode = 'EUR';
      assetScale = 2;
    } else if (lower.includes('gbp') || lower.endsWith('.uk')) {
      assetCode = 'GBP';
      assetScale = 2;
    } else if (lower.includes('mxn') || lower.endsWith('.mx') || lower.includes('bitso')) {
      assetCode = 'MXN';
      assetScale = 2;
    }

    const openPaymentsUrl = cleanPointer.startsWith('$')
      ? `https://${cleanPointer.slice(1)}`
      : cleanPointer;

    return {
      id: openPaymentsUrl,
      pointer: cleanPointer,
      assetCode,
      assetScale,
      authServer: `https://auth.${cleanPointer.replace(/^\$/, '').split('/')[0]}`,
      resourceServer: openPaymentsUrl,
    };
  },

  async requestGrant(
    resolvedWallet: WalletAddressResolved,
    grantAmountNative: number
  ): Promise<GrantSession> {
    await simulateNetworkDelay(450);

    const asset = SUPPORTED_ASSETS[resolvedWallet.assetCode] || SUPPORTED_ASSETS.USD;
    const equivalentUSD = Number((grantAmountNative / asset.exchangeRateToUSD).toFixed(2));

    const grantId = `grant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const session: GrantSession = {
      grantId,
      pointer: resolvedWallet.pointer,
      assetCode: resolvedWallet.assetCode,
      assetScale: resolvedWallet.assetScale,
      totalAmount: grantAmountNative,
      remainingAmount: grantAmountNative,
      equivalentUSD,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 4, // 4 horas
    };

    localStorage.setItem('ilp_grant_token', grantId);
    return session;
  },

  async executeMicroPayment(
    grantSession: GrantSession,
    roundId: string,
    amountUSD = 0.10
  ): Promise<{ updatedGrant: GrantSession; transaction: MicroTransaction }> {
    await simulateNetworkDelay(350);

    // Convertir $0.10 USD a la moneda nativa del jugador
    const nativeDebit = convertUSDToNative(
      amountUSD,
      grantSession.assetCode,
      grantSession.assetScale
    );

    if (grantSession.remainingAmount < nativeDebit) {
      throw new Error(
        `Saldo insuficiente en el permiso (${formatAssetAmount(
          grantSession.remainingAmount,
          grantSession.assetCode,
          grantSession.assetScale
        )} disponibles, se requieren ${formatAssetAmount(
          nativeDebit,
          grantSession.assetCode,
          grantSession.assetScale
        )})`
      );
    }

    const updatedRemaining = Number(
      (grantSession.remainingAmount - nativeDebit).toFixed(grantSession.assetScale)
    );

    const updatedGrant: GrantSession = {
      ...grantSession,
      remainingAmount: updatedRemaining,
    };

    const transaction: MicroTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roundId,
      amount: nativeDebit,
      assetCode: grantSession.assetCode,
      amountUSD,
      type: 'bet',
      status: 'success',
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      description: `Micro-pago de ${formatAssetAmount(
        nativeDebit,
        grantSession.assetCode,
        grantSession.assetScale
      )} ($${amountUSD.toFixed(2)} USD) para Ronda #${roundId}`,
    };

    return { updatedGrant, transaction };
  },

  async creditPayout(
    grantSession: GrantSession,
    roundId: string,
    amountUSD: number
  ): Promise<{ updatedGrant: GrantSession; transaction: MicroTransaction }> {
    await simulateNetworkDelay(250);

    const nativeCredit = convertUSDToNative(
      amountUSD,
      grantSession.assetCode,
      grantSession.assetScale
    );

    const updatedRemaining = Number(
      (grantSession.remainingAmount + nativeCredit).toFixed(grantSession.assetScale)
    );

    const updatedGrant: GrantSession = {
      ...grantSession,
      remainingAmount: updatedRemaining,
    };

    const transaction: MicroTransaction = {
      id: `tx_win_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roundId,
      amount: nativeCredit,
      assetCode: grantSession.assetCode,
      amountUSD,
      type: 'payout',
      status: 'success',
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      description: `Premio acreditado de ${formatAssetAmount(
        nativeCredit,
        grantSession.assetCode,
        grantSession.assetScale
      )} ($${amountUSD.toFixed(2)} USD) de Ronda #${roundId}`,
    };

    return { updatedGrant, transaction };
  },
};

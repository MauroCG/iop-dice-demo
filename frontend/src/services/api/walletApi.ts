import { apiClient, simulateNetworkDelay } from './client';
import type { GrantSession, MicroTransaction } from '../../types/wallet';
import type { WalletAddressResolved } from '../../types/currency';
import { SUPPORTED_ASSETS } from '../../constants/currencies';
import { convertUSDToNative, formatAssetAmount } from '../../utils/formatters';

export const walletApi = {
  // Llama al endpoint backend GET /api/wallet/resolve que ejecuta @interledger/open-payments
  async resolveWalletAddress(pointer: string): Promise<WalletAddressResolved> {
    const cleanPointer = pointer.trim();

    try {
      const res = await apiClient.get<WalletAddressResolved>('/wallet/resolve', {
        params: { pointer: cleanPointer },
      });
      if (res.data && res.data.assetCode) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(150);

    const openPaymentsUrl = cleanPointer.startsWith('$')
      ? `https://${cleanPointer.slice(1)}`
      : cleanPointer;

    const lower = cleanPointer.toLowerCase();
    let assetCode = 'USD';
    let assetScale = 2;

    if (lower.includes('cop') || lower.endsWith('.co') || lower.includes('bancolombia')) {
      assetCode = 'COP';
      assetScale = 0;
    } else if (lower.includes('eur') || lower.endsWith('.eu') || lower.includes('gatehub')) {
      assetCode = 'EUR';
      assetScale = 2;
    } else if (lower.includes('gbp') || lower.endsWith('.uk') || lower.includes('fynbos')) {
      assetCode = 'GBP';
      assetScale = 2;
    } else if (lower.includes('mxn') || lower.endsWith('.mx') || lower.includes('bitso')) {
      assetCode = 'MXN';
      assetScale = 2;
    }

    return {
      id: openPaymentsUrl,
      pointer: cleanPointer.startsWith('$') ? cleanPointer : `$${cleanPointer.replace(/^https?:\/\//, '')}`,
      assetCode,
      assetScale,
      authServer: `https://auth.${cleanPointer.replace(/^\$|^https?:\/\//, '').split('/')[0]}`,
      resourceServer: openPaymentsUrl,
    };
  },

  async requestGrant(
    resolvedWallet: WalletAddressResolved,
    grantAmountNative: number
  ): Promise<GrantSession> {
    try {
      const res = await apiClient.post<GrantSession>('/wallet/grant', {
        walletAddress: resolvedWallet.pointer || resolvedWallet.id,
        assetCode: resolvedWallet.assetCode,
        assetScale: resolvedWallet.assetScale,
        amountNative: grantAmountNative,
        redirectUri: `${window.location.origin}/auth/callback`,
      });

      if (res.data?.requiresRedirect && res.data?.interactUrl) {
        return res.data;
      }

      if (res.data && res.data.grantId) {
        const token = res.data.accessToken || res.data.grantId;
        localStorage.setItem('ilp_grant_token', token);
        if (res.data.accessToken) {
          localStorage.setItem('ilp_access_token', res.data.accessToken);
        }
        return res.data;
      }
    } catch (err: any) {
      console.warn('[walletApi.requestGrant] Error llamando a /wallet/grant:', err.message);
    }

    await simulateNetworkDelay(250);

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
      expiresAt: Date.now() + 1000 * 60 * 60 * 4,
    };

    localStorage.setItem('ilp_grant_token', grantId);
    return session;
  },

  async continueGrant(params: {
    interactRef: string;
    continueUri: string;
    continueToken: string;
    walletAddress: string;
    totalAmount: number;
    assetCode: string;
    assetScale: number;
  }): Promise<GrantSession> {
    const res = await apiClient.post<GrantSession>('/wallet/grant/continue', params);
    if (res.data?.grantId) {
      const realToken = res.data.accessToken || res.data.grantId;
      localStorage.setItem('ilp_grant_token', realToken);
      if (res.data.accessToken) {
        localStorage.setItem('ilp_access_token', res.data.accessToken);
      }
      return res.data;
    }
    throw new Error('Respuesta inválida al continuar autorización');
  },

  async executeMicroPayment(
    grantSession: GrantSession,
    roundId: string,
    amountUSD = 0.10,
    numberGuess?: number
  ): Promise<{ updatedGrant: GrantSession; transaction: MicroTransaction }> {
    if (numberGuess === undefined || isNaN(numberGuess) || numberGuess < 2 || numberGuess > 12) {
      throw new Error('Debes seleccionar un número válido entre 2 y 12 para apostar');
    }

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

    try {
      const res = await apiClient.post<{
        success: boolean;
        transaction: MicroTransaction;
        remainingAmount: number;
      }>('/wallet/bet', {
        roundId,
        walletAddress: grantSession.pointer,
        pointer: grantSession.pointer,
        numberGuess,
        grantToken: grantSession.accessToken,
        assetCode: grantSession.assetCode,
        assetScale: grantSession.assetScale,
        nativeAmount: nativeDebit,
        amountUSD,
        remainingAmount: grantSession.remainingAmount,
      });

      if (res.data?.success && res.data?.transaction) {
        const updatedGrant: GrantSession = {
          ...grantSession,
          remainingAmount: res.data.remainingAmount,
        };
        return { updatedGrant, transaction: res.data.transaction };
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('Network Error') && !err.message.includes('ECONNREFUSED')) {
        // Si el backend arrojó un error de validación de negocio (ej. saldo insuficiente o ronda cerrada)
        throw err;
      }
    }

    await simulateNetworkDelay(250);

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
    await simulateNetworkDelay(200);

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


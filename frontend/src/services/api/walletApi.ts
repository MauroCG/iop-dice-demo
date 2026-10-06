import { simulateNetworkDelay } from './client';
import type { GrantSession, MicroTransaction } from '../../types/wallet';
import { grantRequestSchema } from '../../schemas/wallet.schema';

export const walletApi = {
  async requestGrant(pointer: string, amountUSD: number): Promise<GrantSession> {
    grantRequestSchema.parse({ pointer, amountUSD });
    await simulateNetworkDelay(500);

    const grantId = `grant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const session: GrantSession = {
      grantId,
      pointer,
      totalAmount: amountUSD,
      remainingAmount: amountUSD,
      currency: 'USD',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 4, // 4 hours validity
    };

    localStorage.setItem('ilp_grant_token', grantId);
    return session;
  },

  async executeMicroPayment(
    grantSession: GrantSession,
    roundId: string,
    amountUSD = 0.10
  ): Promise<{ updatedGrant: GrantSession; transaction: MicroTransaction }> {
    await simulateNetworkDelay(400);

    if (grantSession.remainingAmount < amountUSD) {
      throw new Error('Saldo insuficiente en el permiso de micro-pagos');
    }

    const updatedRemaining = Number((grantSession.remainingAmount - amountUSD).toFixed(2));
    const updatedGrant: GrantSession = {
      ...grantSession,
      remainingAmount: updatedRemaining,
    };

    const transaction: MicroTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roundId,
      amount: amountUSD,
      type: 'bet',
      status: 'success',
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      description: `Micro-pago de $${amountUSD.toFixed(2)} USD para Ronda #${roundId}`,
    };

    return { updatedGrant, transaction };
  },

  async creditPayout(
    grantSession: GrantSession,
    roundId: string,
    amountUSD: number
  ): Promise<{ updatedGrant: GrantSession; transaction: MicroTransaction }> {
    await simulateNetworkDelay(300);

    const updatedRemaining = Number((grantSession.remainingAmount + amountUSD).toFixed(2));
    const updatedGrant: GrantSession = {
      ...grantSession,
      remainingAmount: updatedRemaining,
    };

    const transaction: MicroTransaction = {
      id: `tx_win_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roundId,
      amount: amountUSD,
      type: 'payout',
      status: 'success',
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      description: `Premio acreditado de $${amountUSD.toFixed(2)} USD de Ronda #${roundId}`,
    };

    return { updatedGrant, transaction };
  },
};

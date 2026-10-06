import type { WalletAddressResolved } from './currency';

export interface GrantSession {
  grantId: string;
  pointer: string;
  assetCode: string; // 'USD' | 'EUR' | 'GBP' | 'COP' | 'MXN'
  assetScale: number; // 2 o 0
  totalAmount: number; // Monto en la divisa nativa (ej. 20000 COP, 5.00 USD)
  remainingAmount: number; // Monto restante nativo (ej. 19580 COP)
  equivalentUSD: number; // Equivalente en USD (ej. 5.00 USD)
  accessToken?: string;
  continueUri?: string;
  continueToken?: string;
  interactUrl?: string;
  requiresRedirect?: boolean;
  createdAt: number;
  expiresAt: number;
}

export type MicroTxType = 'bet' | 'payout' | 'grant';
export type MicroTxStatus = 'pending' | 'success' | 'failed';

export interface MicroTransaction {
  id: string;
  roundId: string;
  amount: number; // Monto nativo
  assetCode: string;
  amountUSD: number; // Equivalente en USD ($0.10)
  type: MicroTxType;
  status: MicroTxStatus;
  timestamp: number;
  txHash: string;
  description: string;
}

export interface WalletContextType {
  pointer: string | null;
  assetCode: string;
  assetScale: number;
  isConnected: boolean;
  isAuthorizing: boolean;
  grant: GrantSession | null;
  transactions: MicroTransaction[];
  resolveWallet: (pointer: string) => Promise<WalletAddressResolved>;
  connectWallet: (resolvedWallet: WalletAddressResolved, grantAmountNative: number) => Promise<boolean>;
  disconnectWallet: () => void;
  authorizeMicroPayment: (amountUSD: number, roundId: string) => Promise<MicroTransaction>;
  creditPayout: (amountUSD: number, roundId: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isTxHistoryOpen: boolean;
  setIsTxHistoryOpen: (open: boolean) => void;
  isInRoom: boolean;
  enterRoom: () => void;
  leaveRoom: () => void;
  finalizeInteractiveGrant: (session: GrantSession) => void;
}

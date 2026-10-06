export interface GrantSession {
  grantId: string;
  pointer: string;
  totalAmount: number; // e.g. 5.00 ($5.00 USD)
  remainingAmount: number; // e.g. 4.90 ($4.90 USD)
  currency: 'USD';
  createdAt: number;
  expiresAt: number;
}

export type MicroTxType = 'bet' | 'payout' | 'grant';
export type MicroTxStatus = 'pending' | 'success' | 'failed';

export interface MicroTransaction {
  id: string;
  roundId: string;
  amount: number;
  type: MicroTxType;
  status: MicroTxStatus;
  timestamp: number;
  txHash: string;
  description: string;
}

export interface WalletContextType {
  pointer: string | null;
  isConnected: boolean;
  isAuthorizing: boolean;
  grant: GrantSession | null;
  transactions: MicroTransaction[];
  connectWallet: (paymentPointer: string, grantAmountUSD: number) => Promise<boolean>;
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
}

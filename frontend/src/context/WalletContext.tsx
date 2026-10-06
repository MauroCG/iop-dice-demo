import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GrantSession, MicroTransaction, WalletContextType } from '../types/wallet';
import type { WalletAddressResolved } from '../types/currency';
import { walletApi } from '../services/api/walletApi';
import { useToast } from './ToastContext';
import { COPY } from '../constants/copy.es';
import { formatAssetAmount } from '../utils/formatters';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const LOCAL_STORAGE_GRANT_KEY = 'ilp_grant_session';
const LOCAL_STORAGE_TX_KEY = 'ilp_transactions_history';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [pointer, setPointer] = useState<string | null>(null);
  const [assetCode, setAssetCode] = useState<string>('USD');
  const [assetScale, setAssetScale] = useState<number>(2);
  const [grant, setGrant] = useState<GrantSession | null>(null);
  const [transactions, setTransactions] = useState<MicroTransaction[]>([]);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTxHistoryOpen, setIsTxHistoryOpen] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  // Restore saved session if available (always starts with isInRoom = false so user lands in Lobby)
  useEffect(() => {
    try {
      const savedGrant = localStorage.getItem(LOCAL_STORAGE_GRANT_KEY);
      const savedTxs = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (savedGrant) {
        const parsed: GrantSession = JSON.parse(savedGrant);
        if (parsed.expiresAt > Date.now() && parsed.remainingAmount > 0) {
          setGrant(parsed);
          setPointer(parsed.pointer);
          setAssetCode(parsed.assetCode || 'USD');
          setAssetScale(parsed.assetScale !== undefined ? parsed.assetScale : 2);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_GRANT_KEY);
        }
      }
      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const saveGrant = (newGrant: GrantSession | null) => {
    setGrant(newGrant);
    if (newGrant) {
      setAssetCode(newGrant.assetCode);
      setAssetScale(newGrant.assetScale);
      localStorage.setItem(LOCAL_STORAGE_GRANT_KEY, JSON.stringify(newGrant));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_GRANT_KEY);
    }
  };

  const addTransaction = (tx: MicroTransaction) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(updated.slice(0, 50)));
      return updated;
    });
  };

  const resolveWallet = useCallback(async (paymentPointer: string): Promise<WalletAddressResolved> => {
    return await walletApi.resolveWalletAddress(paymentPointer);
  }, []);

  const connectWallet = useCallback(
    async (resolvedWallet: WalletAddressResolved, grantAmountNative: number): Promise<boolean> => {
      setIsAuthorizing(true);
      try {
        const session = await walletApi.requestGrant(resolvedWallet, grantAmountNative);
        saveGrant(session);
        setPointer(session.pointer);
        setAssetCode(session.assetCode);
        setAssetScale(session.assetScale);

        // Record grant creation tx
        addTransaction({
          id: `tx_init_${Date.now()}`,
          roundId: '0',
          amount: grantAmountNative,
          assetCode: session.assetCode,
          amountUSD: session.equivalentUSD,
          type: 'grant',
          status: 'success',
          timestamp: Date.now(),
          txHash: session.grantId,
          description: `Permiso inicial autorizado de ${formatAssetAmount(
            grantAmountNative,
            session.assetCode,
            session.assetScale
          )}`,
        });

        addToast(
          `${COPY.toasts.grantSuccess} ${formatAssetAmount(
            grantAmountNative,
            session.assetCode,
            session.assetScale
          )} (${session.assetCode})`,
          'success',
          'Billetera Conectada'
        );
        setIsModalOpen(false);
        setIsInRoom(true);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al autorizar permiso';
        addToast(message, 'error', 'Fallo de Autorización');
        return false;
      } finally {
        setIsAuthorizing(false);
      }
    },
    [addToast]
  );

  const disconnectWallet = useCallback(() => {
    saveGrant(null);
    setPointer(null);
    setIsInRoom(false);
    addToast(COPY.toasts.walletDisconnected, 'info');
  }, [addToast]);

  const enterRoom = useCallback(() => {
    setIsInRoom(true);
  }, []);

  const leaveRoom = useCallback(() => {
    setIsInRoom(false);
    addToast(
      'Has salido de la sala. (Aviso: Si todos abandonan y nadie gana, el pozo queda en la casa).',
      'warning',
      'Sala Abandonada'
    );
  }, [addToast]);

  const authorizeMicroPayment = useCallback(
    async (amountUSD: number, roundId: string): Promise<MicroTransaction> => {
      if (!grant) {
        setIsModalOpen(true);
        throw new Error('Debes conectar una billetera con permiso activo.');
      }

      try {
        const result = await walletApi.executeMicroPayment(grant, roundId, amountUSD);
        saveGrant(result.updatedGrant);
        addTransaction(result.transaction);
        return result.transaction;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error en micro-pago';
        addToast(message, 'error', 'Error en Transacción');
        throw err;
      }
    },
    [grant, addToast]
  );

  const creditPayout = useCallback(
    async (amountUSD: number, roundId: string): Promise<void> => {
      if (!grant) return;
      try {
        const result = await walletApi.creditPayout(grant, roundId, amountUSD);
        saveGrant(result.updatedGrant);
        addTransaction(result.transaction);
        addToast(
          `${COPY.toasts.winCelebration} ${formatAssetAmount(
            result.transaction.amount,
            grant.assetCode,
            grant.assetScale
          )} ($${amountUSD.toFixed(2)} USD)`,
          'success',
          '¡Victoria!'
        );
      } catch {
        // Fallback
      }
    },
    [grant, addToast]
  );

  return (
    <WalletContext.Provider
      value={{
        pointer,
        assetCode,
        assetScale,
        isConnected: !!grant && grant.remainingAmount > 0,
        isAuthorizing,
        grant,
        transactions,
        resolveWallet,
        connectWallet,
        disconnectWallet,
        authorizeMicroPayment,
        creditPayout,
        isModalOpen,
        setIsModalOpen,
        isTxHistoryOpen,
        setIsTxHistoryOpen,
        isInRoom,
        enterRoom,
        leaveRoom,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet debe ser utilizado dentro de un WalletProvider');
  }
  return context;
}

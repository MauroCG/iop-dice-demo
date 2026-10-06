import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GrantSession, MicroTransaction, WalletContextType } from '../types/wallet';
import { walletApi } from '../services/api/walletApi';
import { useToast } from './ToastContext';
import { COPY } from '../constants/copy.es';
import { formatUSD } from '../utils/formatters';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const LOCAL_STORAGE_GRANT_KEY = 'ilp_grant_session';
const LOCAL_STORAGE_TX_KEY = 'ilp_transactions_history';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [pointer, setPointer] = useState<string | null>(null);
  const [grant, setGrant] = useState<GrantSession | null>(null);
  const [transactions, setTransactions] = useState<MicroTransaction[]>([]);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTxHistoryOpen, setIsTxHistoryOpen] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  // Restore saved session if available
  useEffect(() => {
    try {
      const savedGrant = localStorage.getItem(LOCAL_STORAGE_GRANT_KEY);
      const savedTxs = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (savedGrant) {
        const parsed: GrantSession = JSON.parse(savedGrant);
        if (parsed.expiresAt > Date.now() && parsed.remainingAmount > 0) {
          setGrant(parsed);
          setPointer(parsed.pointer);
          setIsInRoom(true);
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

  const connectWallet = useCallback(
    async (paymentPointer: string, grantAmountUSD: number): Promise<boolean> => {
      setIsAuthorizing(true);
      try {
        const session = await walletApi.requestGrant(paymentPointer, grantAmountUSD);
        saveGrant(session);
        setPointer(session.pointer);

        // Record grant creation tx
        addTransaction({
          id: `tx_init_${Date.now()}`,
          roundId: '0',
          amount: grantAmountUSD,
          type: 'grant',
          status: 'success',
          timestamp: Date.now(),
          txHash: session.grantId,
          description: `Permiso inicial autorizado de ${formatUSD(grantAmountUSD)}`,
        });

        addToast(
          `${COPY.toasts.grantSuccess} ${formatUSD(grantAmountUSD)}`,
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

      if (grant.remainingAmount < amountUSD) {
        addToast(COPY.toasts.grantDepleted, 'error', 'Saldo Insuficiente');
        setIsModalOpen(true);
        throw new Error(COPY.toasts.grantDepleted);
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
          `${COPY.toasts.winCelebration} ${formatUSD(amountUSD)}`,
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
        isConnected: !!grant && grant.remainingAmount > 0,
        isAuthorizing,
        grant,
        transactions,
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

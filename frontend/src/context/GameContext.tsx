import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { GameContextType, RoundState, RecentRoundSummary } from '../types/game';
import type { PlayerBet, RoundOutcome } from '../schemas/game.schema';
import { useWallet } from './WalletContext';
import { useToast } from './ToastContext';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import { BET_AMOUNT_USD } from '../constants/game';
import { gameWsClient } from '../services/websocket/gameWsClient';
import { COPY } from '../constants/copy.es';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { grant, authorizeMicroPayment, isConnected, setIsModalOpen, isInRoom } = useWallet();
  const { addToast } = useToast();
  const { playTick, playWinFanfare } = useAudioFeedback();

  const [roundNumber, setRoundNumber] = useState(1);
  const [roundId, setRoundId] = useState(() => `r_${Date.now()}`);
  const [phase, setPhase] = useState<'BETTING' | 'ROLLING' | 'RESOLVING' | 'SETTLED'>('BETTING');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(30);

  const [accumulatedJackpot, setAccumulatedJackpot] = useState(0.00);
  const [bets, setBets] = useState<PlayerBet[]>([]);
  const [userBet, setUserBet] = useState<PlayerBet | null>(null);

  const [diceValues, setDiceValues] = useState<[number, number] | null>([3, 4]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSubmittingBet, setIsSubmittingBet] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [recentHistory, setRecentHistory] = useState<RecentRoundSummary[]>([
    { roundNumber: 0, diceValues: [4, 3], sum: 7, winnerCount: 0, totalPool: 0.00, timestamp: Date.now() - 40000 },
  ]);

  const pointerRef = useRef(grant?.pointer);
  pointerRef.current = grant?.pointer;

  // Conectar WebSocket y sincronizar estado autoritativo
  useEffect(() => {
    gameWsClient.connect();

    const unsubConnected = gameWsClient.on('CONNECTED', () => {
      if (pointerRef.current) {
        gameWsClient.joinRoom(pointerRef.current, grant?.assetCode || 'USD');
      }
    });

    const unsubRoundState = gameWsClient.on('ROUND_STATE', (data) => {
      if (!data) return;
      setRoundId(data.roundId);
      setRoundNumber(data.roundNumber);
      setPhase(data.phase);
      setTimeLeftSeconds(data.timeLeftSeconds ?? 30);
      setAccumulatedJackpot(data.accumulatedJackpot ?? 0.00);
      setDiceValues(data.diceValues ?? [3, 4]);
      setWinningNumber(data.winningNumber ?? 7);

      const mappedBets: PlayerBet[] = (data.bets || []).map((b: any) => ({
        ...b,
        isLocalPlayer: b.paymentPointer === pointerRef.current,
      }));
      setBets(mappedBets);

      const localBet = mappedBets.find((b) => b.isLocalPlayer);
      if (localBet) {
        setUserBet(localBet);
      }

      if (data.recentHistory?.length) {
        setRecentHistory(data.recentHistory);
      }
    });

    const unsubRoundStart = gameWsClient.on('ROUND_START', (data) => {
      setRoundId(data.roundId);
      setRoundNumber(data.roundNumber);
      setPhase('BETTING');
      setTimeLeftSeconds(data.timeLeftSeconds ?? 30);
      setAccumulatedJackpot(data.accumulatedJackpot ?? 0.00);
      setBets([]);
      setUserBet(null);
      setSelectedNumber(null);
      setWinningNumber(null);
      setIsOutcomeModalOpen(false);
    });

    const unsubTick = gameWsClient.on('ROUND_TICK', (data) => {
      if (data?.timeLeftSeconds !== undefined) {
        setTimeLeftSeconds(data.timeLeftSeconds);
        if (data.timeLeftSeconds <= 5 && data.timeLeftSeconds > 0) {
          playTick();
        }
      }
    });

    const unsubBetPlaced = gameWsClient.on('BET_PLACED', (data) => {
      if (!data) return;
      const isLocal = data.paymentPointer === pointerRef.current;
      const formattedBet: PlayerBet = {
        ...data,
        isLocalPlayer: isLocal,
      };

      setBets((prev) => {
        const filtered = prev.filter((b) => b.id !== data.id && b.paymentPointer !== data.paymentPointer);
        return [...filtered, formattedBet];
      });

      if (isLocal) {
        setUserBet(formattedBet);
      }
    });

    const unsubRolling = gameWsClient.on('ROUND_ROLLING', () => {
      setPhase('ROLLING');
    });

    const unsubOutcome = gameWsClient.on('ROUND_OUTCOME', (data) => {
      if (!data) return;
      setPhase('RESOLVING');
      setDiceValues(data.diceValues);
      setWinningNumber(data.winningNumber);
      setOutcome(data);
      setIsOutcomeModalOpen(true);

      // Actualizar pozo acumulado para la siguiente ronda
      if (data.accumulatedJackpot !== undefined) {
        setAccumulatedJackpot(data.accumulatedJackpot);
      }

      // Guardar en historial reciente
      setRecentHistory((prev) => [
        {
          roundNumber: data.roundNumber,
          diceValues: data.diceValues,
          sum: data.winningNumber,
          winnerCount: data.winners?.length || 0,
          totalPool: data.totalGrossPool,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9),
      ]);

      // Verificar si el usuario local ganó
      const userWon = data.winners?.some((w: any) => w.paymentPointer === pointerRef.current);
      if (userWon) {
        playWinFanfare();
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00F5FF', '#A855F7', '#38BDF8', '#F59E0B'],
          });
        } catch {
          // Fallback
        }
      }

      setTimeout(() => {
        setPhase('SETTLED');
      }, 3500);
    });

    const unsubPayout = gameWsClient.on('PAYOUT_CREDITED', (data) => {
      if (data?.paymentPointer === pointerRef.current) {
        addToast(
          `¡Premio acreditado! Has recibido tu pago saliente en Rafiki Testnet ($${data.amountUSD} USD).`,
          'success',
          '¡Ganador!'
        );
      }
    });

    return () => {
      unsubConnected();
      unsubRoundState();
      unsubRoundStart();
      unsubTick();
      unsubBetPlaced();
      unsubRolling();
      unsubOutcome();
      unsubPayout();
    };
  }, [playTick, playWinFanfare, addToast, grant?.assetCode]);

  // Enviar JOIN_ROOM cuando el usuario ingresa a la sala
  useEffect(() => {
    if (isInRoom && grant?.pointer) {
      gameWsClient.joinRoom(grant.pointer, grant.assetCode);
    }
  }, [isInRoom, grant?.pointer, grant?.assetCode]);

  // Enviar apuesta al backend (ejecuta micro-pago en Rafiki vía Open Payments y broadcast en WS)
  const submitBet = useCallback(async () => {
    if (!selectedNumber) return;

    if (!isConnected || !grant) {
      setIsModalOpen(true);
      return;
    }

    if (phase !== 'BETTING' || timeLeftSeconds <= 1) {
      addToast(COPY.toasts.roundClosed, 'warning');
      return;
    }

    if (userBet) {
      addToast(COPY.game.alreadyBetNotice, 'info');
      return;
    }

    setIsSubmittingBet(true);
    try {
      // 1. Ejecutar micro-pago de apuesta vía REST en el backend con el token de Open Payments
      const tx = await authorizeMicroPayment(BET_AMOUNT_USD, roundId);

      // 2. Notificar inmediatamente por WebSocket
      gameWsClient.send('SUBMIT_BET', {
        roundId,
        numberGuess: selectedNumber,
        pointer: grant.pointer,
        assetCode: grant.assetCode,
        assetScale: grant.assetScale,
        nativeAmount: tx.amount,
        amountUSD: BET_AMOUNT_USD,
        grantToken: grant.accessToken,
      });

      addToast(
        `${COPY.toasts.betSuccess} ${selectedNumber}! Transacción enviada a Rafiki.`,
        'success',
        '¡Apuesta Confirmada!'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar micro-pago';
      addToast(msg, 'error', 'Error en Apuesta');
    } finally {
      setIsSubmittingBet(false);
    }
  }, [
    selectedNumber,
    isConnected,
    grant,
    phase,
    timeLeftSeconds,
    userBet,
    roundId,
    authorizeMicroPayment,
    addToast,
    setIsModalOpen,
  ]);

  const currentRoundPool = Number((bets.length * BET_AMOUNT_USD).toFixed(2));
  const totalPrizePool = Number((currentRoundPool + accumulatedJackpot).toFixed(2));

  const roundState: RoundState = {
    roundId,
    roundNumber,
    phase,
    timeLeftMs: timeLeftSeconds * 1000,
    roundPool: currentRoundPool,
    accumulatedJackpot,
    totalPrizePool,
    bets,
    userBet,
    diceValues,
    winningNumber,
    outcome,
    recentHistory,
  };

  return (
    <GameContext.Provider
      value={{
        roundState,
        selectedNumber,
        setSelectedNumber,
        isSubmittingBet,
        submitBet,
        isOutcomeModalOpen,
        setIsOutcomeModalOpen,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe ser utilizado dentro de un GameProvider');
  }
  return context;
}

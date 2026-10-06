import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { GameContextType, RoundState, RecentRoundSummary } from '../types/game';
import type { PlayerBet, RoundOutcome } from '../schemas/game.schema';
import { useWallet } from './WalletContext';
import { useToast } from './ToastContext';
import { useCountdown } from '../hooks/useCountdown';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import {
  ROUND_DURATION_SECONDS,
  ROLLING_DURATION_SECONDS,
  BET_AMOUNT_USD,
} from '../constants/game';
import { rollDice, calculateRoundPayout } from '../utils/dice';
import { generateRandomPeerBet } from '../services/websocket/mockWsDriver';
import { convertUSDToNative } from '../utils/formatters';
import { COPY } from '../constants/copy.es';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { grant, authorizeMicroPayment, creditPayout, isConnected, setIsModalOpen } = useWallet();
  const { addToast } = useToast();
  const { playTick, playWinFanfare } = useAudioFeedback();

  const [roundNumber, setRoundNumber] = useState(1);
  const [roundId, setRoundId] = useState(() => `r_${Date.now()}`);
  const [phase, setPhase] = useState<'BETTING' | 'ROLLING' | 'RESOLVING' | 'SETTLED'>('BETTING');

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
    { roundNumber: 0, diceValues: [4, 3], sum: 7, winnerCount: 2, totalPool: 0.80, timestamp: Date.now() - 40000 },
  ]);

  // Peer bot bet generation timer during BETTING phase
  const botIntervalRef = useRef<number | null>(null);

  // References for closure values
  const betsRef = useRef(bets);
  betsRef.current = bets;
  const userBetRef = useRef(userBet);
  userBetRef.current = userBet;
  const jackpotRef = useRef(accumulatedJackpot);
  jackpotRef.current = accumulatedJackpot;
  const roundIdRef = useRef(roundId);
  roundIdRef.current = roundId;
  const roundNumRef = useRef(roundNumber);
  roundNumRef.current = roundNumber;

  // Handle countdown expiration (20s -> 0s)
  const handleCountdownExpire = useCallback(() => {
    // Phase transitions to ROLLING
    setPhase('ROLLING');
    if (botIntervalRef.current) {
      clearInterval(botIntervalRef.current);
      botIntervalRef.current = null;
    }

    // 3 seconds of rolling animation
    setTimeout(() => {
      // Calculate outcome
      const [d1, d2] = rollDice();
      const sum = d1 + d2;
      setDiceValues([d1, d2]);
      setWinningNumber(sum);
      setPhase('RESOLVING');

      // Identify winners
      const currentBets = betsRef.current;
      const winners = currentBets.filter((b) => b.numberGuess === sum);
      const currentRoundPool = Number((currentBets.length * BET_AMOUNT_USD).toFixed(2));
      const currentJackpot = jackpotRef.current;

      const payout = calculateRoundPayout(currentRoundPool, currentJackpot, winners.length);

      const roundOutcome: RoundOutcome = {
        roundId: roundIdRef.current,
        diceValues: [d1, d2],
        winningNumber: sum,
        totalGrossPool: payout.totalGrossPool,
        houseFee: payout.houseFee,
        netPrizePool: payout.netPrizePool,
        accumulatedJackpot: payout.rolloverToNextRound,
        winners,
        payoutPerWinner: payout.payoutPerWinner,
      };

      setOutcome(roundOutcome);
      setIsOutcomeModalOpen(true);

      // Check if local player won
      const userWon = userBetRef.current && userBetRef.current.numberGuess === sum;
      if (userWon && payout.payoutPerWinner > 0) {
        creditPayout(payout.payoutPerWinner, roundIdRef.current);
        playWinFanfare();
        // Fire celebration confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00F5FF', '#A855F7', '#38BDF8', '#F59E0B'],
          });
        } catch {
          // Fallback if canvas is unavailable
        }
      }

      // Update jackpot for next round
      setAccumulatedJackpot(payout.rolloverToNextRound);

      // Save to recent history
      setRecentHistory((prev) => [
        {
          roundNumber: roundNumRef.current,
          diceValues: [d1, d2],
          sum,
          winnerCount: winners.length,
          totalPool: payout.totalGrossPool,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9),
      ]);

      // Phase transitions to SETTLED and resets for next round after 4.5 seconds
      setTimeout(() => {
        setPhase('SETTLED');
        setTimeout(() => {
          // Start new round
          setRoundNumber((r) => r + 1);
          setRoundId(`r_${Date.now()}`);
          setBets([]);
          setUserBet(null);
          setSelectedNumber(null);
          setWinningNumber(null);
          setPhase('BETTING');
          countdown.reset(ROUND_DURATION_SECONDS);
        }, 1000);
      }, 4500);
    }, ROLLING_DURATION_SECONDS * 1000);
  }, [creditPayout, playWinFanfare]);

  const countdown = useCountdown({
    durationSeconds: ROUND_DURATION_SECONDS,
    onExpire: handleCountdownExpire,
    autoStart: true,
  });

  // Sound tick on last 5 seconds
  useEffect(() => {
    if (phase === 'BETTING' && countdown.secondsRemaining <= 5 && countdown.secondsRemaining > 0) {
      playTick();
    }
  }, [phase, countdown.secondsRemaining, playTick]);

  // Simulate peer bots placing bets during BETTING phase
  useEffect(() => {
    if (phase === 'BETTING') {
      // Periodic mock peer bet arrivals
      const interval = window.setInterval(() => {
        // 55% chance of a peer bet arriving every 2.8 seconds
        if (Math.random() < 0.55 && countdown.secondsRemaining > 2) {
          const peerBet = generateRandomPeerBet(roundId);
          setBets((prev) => [...prev, peerBet]);
        }
      }, 2600);

      botIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [phase, roundId, countdown.secondsRemaining]);

  // Submit local player's bet
  const submitBet = useCallback(async () => {
    if (!selectedNumber) return;

    if (!isConnected || !grant) {
      setIsModalOpen(true);
      return;
    }

    if (phase !== 'BETTING' || countdown.secondsRemaining <= 1) {
      addToast(COPY.toasts.roundClosed, 'warning');
      return;
    }

    if (userBet) {
      addToast(COPY.game.alreadyBetNotice, 'info');
      return;
    }

    setIsSubmittingBet(true);
    try {
      // Authorize micro-payment (deducts 10 cents from active grant)
      const nativeAmount = convertUSDToNative(BET_AMOUNT_USD, grant.assetCode, grant.assetScale);

      const localBet: PlayerBet = {
        id: `bet_local_${Date.now()}`,
        roundId,
        playerId: 'local_player',
        playerName: 'Tú',
        paymentPointer: grant.pointer,
        assetCode: grant.assetCode,
        assetScale: grant.assetScale,
        nativeAmount,
        numberGuess: selectedNumber,
        amountUSD: 0.10,
        isLocalPlayer: true,
        timestamp: Date.now(),
      };

      setUserBet(localBet);
      setBets((prev) => [...prev, localBet]);
      addToast(
        `${COPY.toasts.betSuccess} ${selectedNumber}!`,
        'success',
        '¡Apuesta Confirmada!'
      );
    } catch {
      // Error handled in WalletContext with toast
    } finally {
      setIsSubmittingBet(false);
    }
  }, [
    selectedNumber,
    isConnected,
    grant,
    phase,
    countdown.secondsRemaining,
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
    timeLeftMs: countdown.timeLeftMs,
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

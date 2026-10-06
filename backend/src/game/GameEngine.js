import crypto from 'crypto';
import { calculateRoundPayout } from './payoutCalculator.js';
import { openPaymentsService } from '../services/openPaymentsService.js';

export const ROUND_DURATION_SECONDS = 30;
export const ROLLING_DURATION_SECONDS = 3;
export const OUTCOME_DISPLAY_SECONDS = 4.5;
export const BET_AMOUNT_USD = 0.10;

export class GameEngine {
  constructor() {
    this.roundNumber = 1;
    this.roundId = `r_${Date.now()}`;
    this.phase = 'BETTING'; // 'BETTING' | 'ROLLING' | 'OUTCOME'
    this.timeLeftSeconds = ROUND_DURATION_SECONDS;
    this.accumulatedJackpot = 0.00;

    this.bets = new Map(); // key: playerPointer -> PlayerBet
    this.activePlayers = new Map(); // key: connectionId -> playerInfo
    this.diceValues = [3, 4];
    this.winningNumber = 7;
    this.lastOutcome = null;

    this.recentHistory = [];
    this.listeners = new Set();
    this.timerInterval = null;
  }

  start() {
    if (this.timerInterval) return;
    console.log('[GameEngine] Motor autoritativo iniciado con ciclo de 30 segundos.');
    this.startBettingPhase();

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  broadcast(type, data) {
    for (const listener of this.listeners) {
      try {
        listener(type, data);
      } catch (err) {
        console.error('[GameEngine] Error en listener de broadcast:', err);
      }
    }
  }

  getState() {
    const betsList = Array.from(this.bets.values());
    const currentRoundPool = Number((betsList.length * BET_AMOUNT_USD).toFixed(2));
    const totalPrizePool = Number((currentRoundPool + this.accumulatedJackpot).toFixed(2));

    return {
      roundId: this.roundId,
      roundNumber: this.roundNumber,
      phase: this.phase,
      timeLeftSeconds: this.timeLeftSeconds,
      timeLeftMs: this.timeLeftSeconds * 1000,
      roundPool: currentRoundPool,
      accumulatedJackpot: this.accumulatedJackpot,
      totalPrizePool,
      bets: betsList,
      diceValues: this.diceValues,
      winningNumber: this.winningNumber,
      outcome: this.lastOutcome,
      recentHistory: this.recentHistory.slice(0, 10),
      activePlayersCount: this.activePlayers.size,
    };
  }

  tick() {
    if (this.phase === 'BETTING') {
      this.timeLeftSeconds -= 1;
      if (this.timeLeftSeconds <= 0) {
        this.startRollingPhase();
      } else {
        // Broadcast tick every 5 seconds or during last 5 seconds
        if (this.timeLeftSeconds <= 5 || this.timeLeftSeconds % 5 === 0) {
          this.broadcast('ROUND_TICK', {
            roundId: this.roundId,
            timeLeftSeconds: this.timeLeftSeconds,
          });
        }
      }
    }
  }

  startBettingPhase() {
    this.phase = 'BETTING';
    this.timeLeftSeconds = ROUND_DURATION_SECONDS;
    this.bets.clear();
    this.broadcast('ROUND_START', this.getState());
  }

  startRollingPhase() {
    this.phase = 'ROLLING';
    this.timeLeftSeconds = ROLLING_DURATION_SECONDS;

    this.broadcast('ROUND_ROLLING', {
      roundId: this.roundId,
      phase: 'ROLLING',
      rollingDurationSeconds: ROLLING_DURATION_SECONDS,
    });

    // Roll dice after animation duration
    setTimeout(() => {
      this.resolveRoundOutcome();
    }, ROLLING_DURATION_SECONDS * 1000);
  }

  async resolveRoundOutcome() {
    this.phase = 'OUTCOME';

    // Criptográficamente seguro (1 a 6)
    const d1 = crypto.randomInt(1, 7);
    const d2 = crypto.randomInt(1, 7);
    const sum = d1 + d2;
    this.diceValues = [d1, d2];
    this.winningNumber = sum;

    const betsList = Array.from(this.bets.values());
    const winners = betsList.filter((b) => b.numberGuess === sum);
    const roundPool = Number((betsList.length * BET_AMOUNT_USD).toFixed(2));

    // Desglose con 10% fee y rollover
    const payout = calculateRoundPayout(roundPool, this.accumulatedJackpot, winners.length);

    this.accumulatedJackpot = payout.rolloverToNextRound;

    const roundOutcome = {
      roundId: this.roundId,
      roundNumber: this.roundNumber,
      diceValues: [d1, d2],
      winningNumber: sum,
      totalGrossPool: payout.totalGrossPool,
      houseFee: payout.houseFee,
      netPrizePool: payout.netPrizePool,
      accumulatedJackpot: payout.rolloverToNextRound,
      winners,
      payoutPerWinner: payout.payoutPerWinner,
      timestamp: Date.now(),
    };

    this.lastOutcome = roundOutcome;
    this.recentHistory.unshift({
      roundNumber: this.roundNumber,
      diceValues: [d1, d2],
      sum,
      winnerCount: winners.length,
      totalPool: payout.totalGrossPool,
      timestamp: Date.now(),
    });

    this.broadcast('ROUND_OUTCOME', roundOutcome);

    // Acreditación automática de premio a ganadores reales vía Open Payments
    if (winners.length > 0 && payout.payoutPerWinner > 0) {
      for (const winner of winners) {
        try {
          const payoutReceipt = await openPaymentsService.executePayoutToWinner({
            winnerPointer: winner.paymentPointer,
            assetCode: winner.assetCode,
            assetScale: winner.assetScale,
            payoutUSD: payout.payoutPerWinner,
            roundId: this.roundId,
          });

          this.broadcast('PAYOUT_CREDITED', {
            roundId: this.roundId,
            playerId: winner.playerId,
            paymentPointer: winner.paymentPointer,
            amountUSD: payout.payoutPerWinner,
            nativePayout: payoutReceipt.nativePayout,
            assetCode: winner.assetCode,
            txHash: payoutReceipt.txHash,
          });
        } catch (err) {
          console.error(`[GameEngine] Error acreditando premio a ${winner.paymentPointer}:`, err);
        }
      }
    }

    // Espera el tiempo de visualización del modal antes de iniciar la siguiente ronda
    setTimeout(() => {
      this.roundNumber += 1;
      this.roundId = `r_${Date.now()}`;
      this.startBettingPhase();
    }, OUTCOME_DISPLAY_SECONDS * 1000);
  }

  /**
   * Registers a bet in the current round.
   * Validates:
   * 1. Must be in BETTING phase
   * 2. Must be within time window
   * 3. Number must be between 2 and 12
   * 4. Strictly 1 bet per player pointer per round
   */
  placeBet(betData) {
    if (this.phase !== 'BETTING' || this.timeLeftSeconds <= 1) {
      throw new Error('La ronda de apuestas actual está cerrada.');
    }

    const { pointer, numberGuess } = betData;
    if (!pointer) throw new Error('Puntero de billetera no provisto');

    const guess = Number(numberGuess);
    if (isNaN(guess) || guess < 2 || guess > 12) {
      throw new Error('El número apostado debe ser un entero entre 2 y 12');
    }

    if (this.bets.has(pointer)) {
      throw new Error('Ya has registrado una apuesta para esta ronda. Límite: 1 apuesta por ronda.');
    }

    const bet = {
      id: `bet_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      roundId: this.roundId,
      playerId: pointer,
      playerName: betData.playerName || pointer.split('/').pop() || 'Jugador',
      paymentPointer: pointer,
      assetCode: betData.assetCode || 'USD',
      assetScale: betData.assetScale !== undefined ? betData.assetScale : 2,
      nativeAmount: betData.nativeAmount || 0.10,
      numberGuess: guess,
      amountUSD: BET_AMOUNT_USD,
      timestamp: Date.now(),
    };

    this.bets.set(pointer, bet);

    // Notificar a toda la sala
    this.broadcast('BET_PLACED', bet);
    return bet;
  }

  registerPlayer(connectionId, playerInfo) {
    this.activePlayers.set(connectionId, {
      ...playerInfo,
      joinedAt: Date.now(),
    });
    this.broadcast('PLAYER_COUNT_UPDATED', { count: this.activePlayers.size });
  }

  removePlayer(connectionId) {
    this.activePlayers.delete(connectionId);
    this.broadcast('PLAYER_COUNT_UPDATED', { count: this.activePlayers.size });
  }
}

// Singleton instance
export const gameEngine = new GameEngine();

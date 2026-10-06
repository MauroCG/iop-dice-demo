import type { PlayerBet, RoundOutcome } from '../schemas/game.schema';

export type GamePhase = 'BETTING' | 'ROLLING' | 'RESOLVING' | 'SETTLED';

export interface RoundState {
  roundId: string;
  roundNumber: number;
  phase: GamePhase;
  timeLeftMs: number; // 20000ms -> 0ms
  roundPool: number; // Sum of current round's $0.10 bets
  accumulatedJackpot: number; // Rollover pool from prior rounds with 0 winners
  totalPrizePool: number; // roundPool + accumulatedJackpot
  bets: PlayerBet[];
  userBet: PlayerBet | null; // Strictly 1 guess per player
  diceValues: [number, number] | null;
  winningNumber: number | null;
  outcome: RoundOutcome | null;
  recentHistory: RecentRoundSummary[];
}

export interface RecentRoundSummary {
  roundNumber: number;
  diceValues: [number, number];
  sum: number;
  winnerCount: number;
  totalPool: number;
  timestamp: number;
}

export interface GameContextType {
  roundState: RoundState;
  selectedNumber: number | null;
  setSelectedNumber: (num: number | null) => void;
  isSubmittingBet: boolean;
  submitBet: () => Promise<void>;
  isOutcomeModalOpen: boolean;
  setIsOutcomeModalOpen: (open: boolean) => void;
}

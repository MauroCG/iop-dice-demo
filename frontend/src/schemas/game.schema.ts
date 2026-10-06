import { z } from 'zod';

export const betGuessSchema = z
  .number()
  .int('El número debe ser un número entero')
  .min(2, 'La suma mínima de dos dados es 2')
  .max(12, 'La suma máxima de dos dados es 12');

export const playerBetSchema = z.object({
  id: z.string(),
  roundId: z.string(),
  playerId: z.string(),
  playerName: z.string(),
  paymentPointer: z.string(),
  assetCode: z.string().default('USD'),
  assetScale: z.number().default(2),
  nativeAmount: z.number().positive(),
  numberGuess: betGuessSchema,
  amountUSD: z.number().refine((val) => val === 0.10, {
    message: 'La apuesta debe ser estrictamente de $0.10 USD en la mesa',
  }),
  isLocalPlayer: z.boolean(),
  timestamp: z.number(),
});

export const roundOutcomeSchema = z.object({
  roundId: z.string(),
  diceValues: z.tuple([
    z.number().min(1).max(6),
    z.number().min(1).max(6),
  ]),
  winningNumber: betGuessSchema,
  totalGrossPool: z.number().nonnegative(),
  houseFee: z.number().nonnegative(),
  netPrizePool: z.number().nonnegative(),
  accumulatedJackpot: z.number().nonnegative(),
  winners: z.array(playerBetSchema),
  payoutPerWinner: z.number().nonnegative(),
});

export type BetGuess = z.infer<typeof betGuessSchema>;
export type PlayerBet = z.infer<typeof playerBetSchema>;
export type RoundOutcome = z.infer<typeof roundOutcomeSchema>;

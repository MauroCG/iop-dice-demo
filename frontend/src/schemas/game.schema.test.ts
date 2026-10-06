import { describe, it, expect } from 'vitest';
import { betGuessSchema, playerBetSchema } from './game.schema';

describe('Esquemas Zod de Apuestas y Resultados de Juego', () => {
  it('valida betGuessSchema entre 2 y 12 exclusivamente', () => {
    expect(betGuessSchema.safeParse(2).success).toBe(true);
    expect(betGuessSchema.safeParse(7).success).toBe(true);
    expect(betGuessSchema.safeParse(12).success).toBe(true);

    expect(betGuessSchema.safeParse(1).success).toBe(false);
    expect(betGuessSchema.safeParse(13).success).toBe(false);
    expect(betGuessSchema.safeParse(7.5).success).toBe(false);
  });

  it('valida playerBetSchema exigiendo monto fijo de $0.10 USD', () => {
    const validBet = playerBetSchema.safeParse({
      id: 'bet_1',
      roundId: 'r_1',
      playerId: 'p1',
      playerName: 'Player1',
      paymentPointer: '$ilp.rafiki.money/alice',
      numberGuess: 7,
      amountUSD: 0.10,
      isLocalPlayer: true,
      timestamp: Date.now(),
    });
    expect(validBet.success).toBe(true);

    const invalidAmount = playerBetSchema.safeParse({
      id: 'bet_2',
      roundId: 'r_1',
      playerId: 'p1',
      playerName: 'Player1',
      paymentPointer: '$ilp.rafiki.money/alice',
      numberGuess: 7,
      amountUSD: 0.25, // No permitido (apuesta fija es 0.10)
      isLocalPlayer: true,
      timestamp: Date.now(),
    });
    expect(invalidAmount.success).toBe(false);
  });
});

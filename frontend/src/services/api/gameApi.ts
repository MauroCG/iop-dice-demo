import { simulateNetworkDelay } from './client';
import type { PlayerBet } from '../../schemas/game.schema';
import { playerBetSchema } from '../../schemas/game.schema';

export const gameApi = {
  async submitBet(bet: PlayerBet): Promise<PlayerBet> {
    playerBetSchema.parse(bet);
    await simulateNetworkDelay(250);
    return bet;
  },
};

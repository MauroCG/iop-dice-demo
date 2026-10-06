import { gameEngine } from '../game/GameEngine.js';

export const gameController = {
  getState(req, res) {
    try {
      const state = gameEngine.getState();
      return res.json(state);
    } catch (err) {
      console.error('[gameController.getState] Error:', err);
      return res.status(500).json({ error: 'Error al consultar estado del juego' });
    }
  },
};

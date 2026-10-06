import http from 'http';
import express from 'express';
import cors from 'cors';
import { ENV } from './src/config/env.js';
import { initOpenPaymentsClient, isOpenPaymentsLive } from './src/config/openPayments.js';
import walletRoutes from './src/routes/walletRoutes.js';
import gameRoutes from './src/routes/gameRoutes.js';
import { setupWebSocketServer } from './src/websocket/wsServer.js';
import { gameEngine } from './src/game/GameEngine.js';

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isOpenPaymentsLive() ? 'live_rafiki' : 'transitional_mock',
    roundNumber: gameEngine.roundNumber,
    activePlayers: gameEngine.activePlayers.size,
    timestamp: Date.now(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Express] Error:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

// HTTP & WebSocket Servers
const server = http.createServer(app);
setupWebSocketServer(server);

// Iniciar aplicación
async function bootstrap() {
  try {
    // 1. Inicializar cliente Open Payments
    await initOpenPaymentsClient();

    // 2. Iniciar motor autoritativo de juego (ciclo de 30s)
    gameEngine.start();

    // 3. Levantar servidor HTTP y WebSocket
    server.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Servidor ILP Dice Game corriendo en:`);
      console.log(`   HTTP API:  http://localhost:${ENV.PORT}/api`);
      console.log(`   WebSocket: ws://localhost:${ENV.PORT}/ws`);
      console.log(`   Modo OP:   ${isOpenPaymentsLive() ? 'LIVE (Rafiki Testnet)' : 'TRANSITIONAL (Simulación / Fallback)'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Error fatal al iniciar servidor:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export { app, server, bootstrap };

import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { gameEngine } from '../game/GameEngine.js';

export function setupWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Suscribir el WebSocket Server a todos los broadcasts del GameEngine
  gameEngine.subscribe((type, data) => {
    const payload = JSON.stringify({ type, data });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  });

  wss.on('connection', (ws, req) => {
    const connectionId = `conn_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    ws.connectionId = connectionId;
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    console.log(`[WebSocket] Nuevo cliente conectado: ${connectionId}`);

    // Enviar estado actual del juego inmediatamente
    ws.send(
      JSON.stringify({
        type: 'ROUND_STATE',
        data: gameEngine.getState(),
      })
    );

    ws.on('message', (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        const { type, data } = message;

        switch (type) {
          case 'JOIN_ROOM': {
            gameEngine.registerPlayer(connectionId, {
              pointer: data?.pointer,
              assetCode: data?.assetCode,
              playerName: data?.playerName,
            });
            ws.send(
              JSON.stringify({
                type: 'ROOM_JOINED',
                data: {
                  connectionId,
                  state: gameEngine.getState(),
                },
              })
            );
            break;
          }

          case 'SUBMIT_BET': {
            try {
              const bet = gameEngine.placeBet(data);
              ws.send(
                JSON.stringify({
                  type: 'BET_CONFIRMED',
                  data: bet,
                })
              );
            } catch (err) {
              ws.send(
                JSON.stringify({
                  type: 'ERROR',
                  data: {
                    message: err.message,
                    code: 'BET_REJECTED',
                  },
                })
              );
            }
            break;
          }

          case 'LEAVE_ROOM': {
            gameEngine.removePlayer(connectionId);
            ws.send(
              JSON.stringify({
                type: 'ROOM_LEFT',
                data: { success: true },
              })
            );
            break;
          }

          case 'PING': {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
            break;
          }

          default:
            console.warn(`[WebSocket] Mensaje no reconocido: ${type}`);
        }
      } catch (err) {
        console.error('[WebSocket] Error al procesar mensaje entrante:', err);
        ws.send(
          JSON.stringify({
            type: 'ERROR',
            data: { message: 'Mensaje JSON inválido o malformado' },
          })
        );
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Cliente desconectado: ${connectionId}`);
      gameEngine.removePlayer(connectionId);
    });

    ws.on('error', (err) => {
      console.error(`[WebSocket] Error en conexión ${connectionId}:`, err);
    });
  });

  // Heartbeat ping interval cada 30 segundos
  const pingInterval = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  return wss;
}

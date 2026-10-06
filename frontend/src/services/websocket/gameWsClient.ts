type EventCallback = (data: any) => void;

class GameWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectTimer: number | null = null;
  private isExplicitlyClosed = false;
  private pingInterval: number | null = null;

  constructor() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultWsUrl = `${wsProtocol}//${window.location.hostname}:5001/ws`;
    this.url = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Conectado exitosamente al servidor de juego:', this.url);
        this.emit('CONNECTED', { timestamp: Date.now() });

        // Iniciar ping cada 25 segundos
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = window.setInterval(() => {
          this.send('PING', {});
        }, 25000);
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { type, data } = parsed;
          if (type) {
            this.emit(type, data);
          }
        } catch (err) {
          console.warn('[WebSocket] Error al deserializar mensaje:', err);
        }
      };

      this.ws.onclose = () => {
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }

        this.emit('DISCONNECTED', {});

        if (!this.isExplicitlyClosed) {
          console.log('[WebSocket] Conexión cerrada. Intentando reconectar en 2.5s...');
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = window.setTimeout(() => {
            this.connect();
          }, 2500);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Error en socket:', err);
      };
    } catch (err) {
      console.warn('[WebSocket] No se pudo inicializar WebSocket:', err);
    }
  }

  disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, data: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  on(type: string, callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => this.off(type, callback);
  }

  off(type: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(type: string, data: any): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[WebSocket] Error en callback para ${type}:`, err);
        }
      });
    }
  }

  joinRoom(pointer: string, assetCode = 'USD', playerName?: string): void {
    this.send('JOIN_ROOM', { pointer, assetCode, playerName });
  }

  leaveRoom(pointer: string): void {
    this.send('LEAVE_ROOM', { pointer });
  }
}

export const gameWsClient = new GameWebSocketClient();

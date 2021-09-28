import { WebSocket } from "ws";

import { WebSocketServer } from "./WebSocketServer";

/**
 * Conexão com o servidor websocket.
 */
export class WebSocketServerConnection {
  /**
   * Construtor.
   * @param server Servidor websocket.
   * @param webSocket Conexão.
   */
  public constructor(
    public readonly server: WebSocketServer,
    private readonly webSocket: WebSocket
  ) {}
}

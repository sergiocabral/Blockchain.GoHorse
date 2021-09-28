import { IncomingMessage } from "http";
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
   * @param incomingMessage Mensagem de entrada.
   */
  public constructor(
    public readonly server: WebSocketServer,
    private readonly webSocket: WebSocket,
    private readonly incomingMessage: IncomingMessage
  ) {}
}

import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server recebeu uma conexão.
 */
export class WebSocketServerConnectionOpened extends Message {
  /**
   * Construtor.
   * @param server Servidor.
   * @param connection Conexão.
   */
  public constructor(
    public readonly server: WebSocketServer,
    public readonly connection: WebSocketServerConnection
  ) {
    super();
  }
}

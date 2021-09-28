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
    server: WebSocketServer,
    connection: WebSocketServerConnection
  ) {
    super();
  }
}

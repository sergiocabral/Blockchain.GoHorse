import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server recebeu uma finalização de conexão.
 */
export class WebSocketServerConnectionMessage extends Message {
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

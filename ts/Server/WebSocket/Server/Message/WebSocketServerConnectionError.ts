import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server teve uma conexão que gerou um erro.
 */
export class WebSocketServerConnectionError extends Message {
  /**
   * Construtor.
   * @param server Servidor.
   * @param connection Conexão.
   * @param error Erro.
   */
  public constructor(
    server: WebSocketServer,
    connection: WebSocketServerConnection,
    error: Error
  ) {
    super();
  }
}

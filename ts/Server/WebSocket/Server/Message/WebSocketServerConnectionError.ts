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
    public readonly server: WebSocketServer,
    public readonly connection: WebSocketServerConnection,
    public readonly error: Error
  ) {
    super();
  }
}

import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server recebeu uma mensagem através de uma conexão.
 */
export class WebSocketServerConnectionMessageReceived extends Message {
  /**
   * Construtor.
   * @param server Servidor.
   * @param connection Conexão.
   * @param message Mensagem.
   */
  public constructor(
    server: WebSocketServer,
    connection: WebSocketServerConnection,
    message: string
  ) {
    super();
  }
}

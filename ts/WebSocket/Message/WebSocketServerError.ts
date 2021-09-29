import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";

/**
 * Ocorreu um erro no servidor websocket.
 */
export class WebSocketServerError extends Message {
  /**
   * Construtor.
   * @param instance Servidor websocket.
   * @param error Erro.
   */
  public constructor(
    public readonly instance: WebSocketServer,
    public readonly error: Error
  ) {
    super();
  }
}

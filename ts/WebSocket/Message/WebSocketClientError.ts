import { Message } from "@sergiocabral/helper";

import { WebSocketClient } from "../WebSockerClient";

/**
 * Ocorreu um erro no cliente websocket.
 */
export class WebSocketClientError extends Message {
  /**
   * Construtor.
   * @param instance Cliente websocket.
   * @param error Erro.
   */
  public constructor(
    public readonly instance: WebSocketClient,
    public readonly error: Error
  ) {
    super();
  }
}

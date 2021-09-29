import { Message } from "@sergiocabral/helper";

import { WebSocketClient } from "../WebSockerClient";

/**
 * Um cliente websocket recebeu uma mensagem.
 */
export class WebSocketClientMessageReceived extends Message {
  /**
   * Construtor.
   * @param instance Cliente websocket.
   * @param message Mensagem.
   */
  public constructor(
    public readonly instance: WebSocketClient,
    public readonly message: string
  ) {
    super();
  }
}

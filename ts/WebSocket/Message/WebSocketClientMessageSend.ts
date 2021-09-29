import { Message } from "@sergiocabral/helper";

import { WebSocketClient } from "../WebSockerClient";

/**
 * Envia uma mensagem através de um cliente websocket.
 */
export class WebSocketClientMessageSend extends Message {
  /**
   * Sinaliza que a mensagem foi entregue.
   */
  public delivered = false;

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

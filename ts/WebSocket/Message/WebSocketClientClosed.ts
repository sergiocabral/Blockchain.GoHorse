import { Message } from "@sergiocabral/helper";

import { WebSocketClient } from "../WebSockerClient";

/**
 * Um cliente websocket finalizou a conexão.
 */
export class WebSocketClientClosed extends Message {
  /**
   * Construtor.
   * @param instance Cliente websocket.
   */
  public constructor(public readonly instance: WebSocketClient) {
    super();
  }
}

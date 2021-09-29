import { Message } from "@sergiocabral/helper";

import { WebSocketClient } from "../WebSockerClient";

/**
 * Um cliente websocket estabeleceu uma conexão.
 */
export class WebSocketClientOpened extends Message {
  /**
   * Construtor.
   * @param direction Direção da conexão.
   * @param instance Cliente websocket.
   */
  public constructor(
    public readonly direction: "input" | "output",
    public readonly instance: WebSocketClient
  ) {
    super();
  }
}

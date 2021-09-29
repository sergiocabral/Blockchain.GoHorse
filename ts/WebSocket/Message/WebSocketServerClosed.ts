import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";

/**
 * Um servidor websocket finalizou.
 */
export class WebSocketServerClosed extends Message {
  /**
   * Construtor.
   * @param instance Servidor websocket.
   */
  public constructor(public readonly instance: WebSocketServer) {
    super();
  }
}

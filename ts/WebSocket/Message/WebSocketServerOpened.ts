import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";

/**
 * Um servidor websocket está aberto para conexões.
 */
export class WebSocketServerOpened extends Message {
  /**
   * Construtor.
   * @param instance Servidor websocket.
   */
  public constructor(public readonly instance: WebSocketServer) {
    super();
  }
}

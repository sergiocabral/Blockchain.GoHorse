import { Message } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../WebSocket/Message/WebSocketClientMessageReceived";
import { WebSocketClient } from "../WebSocket/WebSockerClient";

/**
 * Enviador de mensagem via websocket.
 */
export class BusMessageSender {
  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   */
  public constructor(private readonly webSocketClient: WebSocketClient) {
    Message.subscribe(
      WebSocketClientMessageReceived,
      this.handleWebSocketClientMessageReceived.bind(this)
    );
  }

  /**
   * Mensagem: WebSocketClientMessageReceived
   */
  private handleWebSocketClientMessageReceived(
    message: WebSocketClientMessageReceived
  ): void {
    if (!Object.is(this.webSocketClient, message.instance)) {
      return;
    }
  }
}

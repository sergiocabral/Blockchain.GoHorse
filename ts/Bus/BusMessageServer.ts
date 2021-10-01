import { Message } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../WebSocket/Message/WebSocketClientMessageReceived";
import { WebSocketClientFromServer } from "../WebSocket/WebSocketClientFromServer";
import { WebSocketServer } from "../WebSocket/WebSocketServer";

import { BusMessage } from "./BusMessage";

/**
 * Roteador de mensagem via websocket.
 */
export class BusMessageServer extends BusMessage {
  /**
   * Construtor.
   * @param webSocketServer Servidor websocket.
   */
  public constructor(private readonly webSocketServer: WebSocketServer) {
    super();
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
    if (
      !(
        message.instance instanceof WebSocketClientFromServer &&
        Object.is(this.webSocketServer, message.instance.server)
      )
    ) {
      return;
    }

    const busMessage = this.decode(message.message);
    if (busMessage === undefined) {
      return;
    }
  }
}

import { Message } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../WebSocket/Message/WebSocketClientMessageReceived";
import { WebSocketClientMessageSend } from "../WebSocket/Message/WebSocketClientMessageSend";
import { WebSocketClient } from "../WebSocket/WebSockerClient";

import { AllChannels, ALL_CHANNELS } from "./AllChannels";
import { BusMessageEncoder } from "./BusMessageEncoder";
import { BusMessageReceived } from "./Message/BusMessageReceived";
import { BusMessageSend } from "./Message/BusMessageSend";

/**
 * Cliente de acesso ao Bus.
 */
export class BusMessageClient {
  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   * @param subscribeChannels Canais para se inscrever e receber mensagens.
   */
  public constructor(
    private readonly webSocketClient: WebSocketClient,
    public subscribeChannels: AllChannels | string[] = ALL_CHANNELS
  ) {
    Message.subscribe(
      WebSocketClientMessageReceived,
      this.handleWebSocketClientMessageReceived.bind(this)
    );
    Message.subscribe(BusMessageSend, this.handleBusMessageSend.bind(this));
  }

  /**
   * Mensagem: BusMessageSend
   */
  private handleBusMessageSend(message: BusMessageSend): void {
    if (!Object.is(this, message.busMessageClient)) {
      return;
    }

    void new WebSocketClientMessageSend(
      this.webSocketClient,
      BusMessageEncoder.encode(message.busMessage)
    ).sendAsync();
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

    const busMessage = BusMessageEncoder.decode(message.message);
    if (busMessage === undefined) {
      return;
    }

    void new BusMessageReceived(this, busMessage).sendAsync();
  }
}

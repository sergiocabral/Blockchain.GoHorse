import { Message } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../WebSocket/Message/WebSocketClientMessageReceived";
import { WebSocketClientMessageSend } from "../WebSocket/Message/WebSocketClientMessageSend";
import { WebSocketClient } from "../WebSocket/WebSockerClient";

import { AllChannels, ALL_CHANNELS } from "./AllChannels";
import { IBusMessage } from "./BusMessage/IBusMessage";
import { BusMessageEncoder } from "./BusMessageEncoder";

/**
 * Enviador de mensagem via websocket.
 */
export class BusMessageClient {
  /**
   * Lista de handlers para mensagens recebidas.
   */
  public readonly messageHandlers: Array<(message: IBusMessage) => void>;

  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   * @param subscribeChannels Canais para se inscrever e receber mensagens.
   * @param messageHandlers Lista de handlers para mensagens recebidas.
   */
  public constructor(
    private readonly webSocketClient: WebSocketClient,
    public subscribeChannels: AllChannels | string[] = ALL_CHANNELS,
    ...messageHandlers: Array<(message: IBusMessage) => void>
  ) {
    this.messageHandlers = messageHandlers;
    Message.subscribe(
      WebSocketClientMessageReceived,
      this.handleWebSocketClientMessageReceived.bind(this)
    );
  }

  /**
   * Envia uma mensagem
   * @param busMessage Mensagem
   */
  public send(busMessage: IBusMessage) {
    void new WebSocketClientMessageSend(
      this.webSocketClient,
      BusMessageEncoder.encode(busMessage)
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

    this.messageHandlers.forEach((messageHandler) =>
      messageHandler(busMessage)
    );
  }
}

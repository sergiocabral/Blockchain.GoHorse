import { Message } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../WebSocket/Message/WebSocketClientMessageReceived";
import { WebSocketClientMessageSend } from "../WebSocket/Message/WebSocketClientMessageSend";
import { WebSocketClientOpened } from "../WebSocket/Message/WebSocketClientOpened";
import { WebSocketClient } from "../WebSocket/WebSockerClient";

import { BusBase } from "./BusBase";
import { ListOfChannels } from "./ListOfChannels";
import { BusReceived } from "./Message/BusReceived";
import { BusSend } from "./Message/BusSend";
import { BusSubscribeChannels } from "./Message/BusSubscribeChannels";

/**
 * Cliente de acesso ao Bus.
 */
export class BusClient extends BusBase {
  /**
   * Seleção de canais inscritos.
   */
  private subscribeChannels: ListOfChannels = [/.*/];

  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   */
  public constructor(private readonly webSocketClient: WebSocketClient) {
    super();
    Message.subscribe(
      WebSocketClientMessageReceived,
      this.handleWebSocketClientMessageReceived.bind(this)
    );
    Message.subscribe(BusSend, this.handleBusMessageSend.bind(this));
    Message.subscribe(
      BusSubscribeChannels,
      this.handleBusSubscribeChannels.bind(this)
    );

    Message.subscribe(WebSocketClientOpened, (message) =>
      this.updateSubscribed(this.subscribeChannels)
    );
  }

  /**
   * Mensagem: BusMessageSend
   */
  private handleBusMessageSend(message: BusSend): void {
    if (!Object.is(this, message.instance)) {
      return;
    }

    void new WebSocketClientMessageSend(
      this.webSocketClient,
      this.encode(message.busMessage)
    ).sendAsync();
  }

  /**
   * Message: BusSubscribeChannels
   */
  private handleBusSubscribeChannels(message: BusSubscribeChannels): void {
    if (!Object.is(this, message.instance)) {
      return;
    }

    this.subscribeChannels = Array.isArray(message.channels)
      ? Array<string | RegExp>().concat(message.channels)
      : message.channels;
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

    const busMessage = this.decode(message.message);
    if (busMessage === undefined) {
      return;
    }

    void new BusReceived(this, busMessage).sendAsync();
  }

  /**
   * Comunicação ao servidor os canais que devem ser ouvidos.
   */
  private updateSubscribed(channels: ListOfChannels): void {
    if (!this.webSocketClient.started) {
      return;
    }

    // TODO: Comunicar ao server os novos canais.
  }
}

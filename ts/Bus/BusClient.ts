import { Logger, LogLevel } from "@sergiocabral/helper";
import md5 from "md5";

import { WebSocketClient } from "../WebSocket/WebSocketClient";

import { Bus } from "./Bus";
import { BusMessageJoin } from "./BusMessage/BusMessageJoin";
import { IBusMessage } from "./BusMessage/IBusMessage";

/**
 * Cliente de acesso ao Bus.
 */
export class BusClient extends Bus {
  /**
   * Identificador do cliente.
   */
  private readonly id: string;

  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   * @param channel Nome do canal.
   */
  public constructor(
    private readonly webSocketClient: WebSocketClient,
    private readonly channel: string
  ) {
    super();

    this.id = md5(Math.random().toString());

    webSocketClient.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    webSocketClient.onOpen.add(this.handleWebSocketClientOpen.bind(this));
    this.handleWebSocketClientOpen();
  }

  /**
   * Enviar uma mensagem.
   * @param message Mensagem
   */
  public send(message: IBusMessage): void {
    if (!this.webSocketClient.opened) {
      Logger.post(
        "Cannot send a message {messageType}@{messageId} because the websocket was closed.",
        { messageId: message.id, messageType: message.type },
        LogLevel.Error,
        BusClient.name
      );

      return;
    }

    message.clientId = this.id;
    const messageEncoded = this.encode(message);
    this.webSocketClient.send(messageEncoded);

    Logger.post(
      "Sent message {messageType}@{messageId} to channels {channels}.",
      () => ({
        channels: message.channels.map((channel) => `"${channel}"`).join(", "),
        clientId: message.clientId,
        messageId: message.id,
        messageType: message.type,
      }),
      LogLevel.Verbose,
      Bus.name
    );
  }

  /**
   * Handle: mensagem recebida pelo cliente websocket.
   */
  private handleWebSocketClientMessage(message: string): void {
    const busMessage = this.decode(message);
    if (busMessage !== undefined) {
      this.dispatch(busMessage);
    }
  }

  /**
   * Handle: cliente websocket abriu a conexão.
   */
  private handleWebSocketClientOpen() {
    if (this.webSocketClient.opened) {
      const busMessage = new BusMessageJoin(this.id, this.channel);
      this.send(busMessage);

      Logger.post(
        'Join the server on "{channel}" channel with id "{clientId}".',
        {
          channel: this.channel,
          clientId: this.id,
        },
        LogLevel.Verbose,
        BusClient.name
      );
    }
  }
}

import { Logger, LogLevel } from "@sergiocabral/helper";
import sha1 from "sha1";

import { ConnectionState } from "../Core/Connection/ConnectionState";
import { WebSocketClient } from "../WebSocket/WebSocketClient";

import { Bus } from "./Bus";
import { BusMessage } from "./BusMessage/BusMessage";
import { BusMessageJoin } from "./BusMessage/Negotiation/BusMessageJoin";
import { ICreateBusMessage } from "./ICreateBusMessage";

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
   * @param createBusMessage Criação de mensagens para o Bus
   */
  public constructor(
    private readonly webSocketClient: WebSocketClient,
    private readonly channel: string,
    createBusMessage: ICreateBusMessage
  ) {
    super(createBusMessage);

    this.id = sha1(Math.random().toString());

    webSocketClient.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    webSocketClient.onOpen.add(this.handleWebSocketClientOpen.bind(this));
    this.handleWebSocketClientOpen();
  }

  /**
   * Enviar uma mensagem.
   * @param message Mensagem
   */
  public send(message: BusMessage): void {
    if (this.webSocketClient.state !== ConnectionState.Ready) {
      Logger.post(
        "Cannot send a message {messageType}@{messageId} because the websocket was not ready.",
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
   * Handle: Mensagem do bus recebida
   */
  protected override async handleBusMessage(
    busMessage: BusMessage,
    client: WebSocketClient
  ): Promise<void> {
    await busMessage.sendAsync();
  }

  /**
   * Handle: cliente websocket abriu a conexão.
   */
  private handleWebSocketClientOpen() {
    if (this.webSocketClient.state === ConnectionState.Ready) {
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

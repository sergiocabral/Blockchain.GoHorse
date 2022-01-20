import { Logger, LogLevel, Message } from '@sergiocabral/helper';
import sha1 from 'sha1';
import { Bus } from './Bus';
import { BusMessage } from '../BusMessage/BusMessage';
import { BusMessageJoin } from '../BusMessage/Negotiation/BusMessageJoin';
import { SendBusMessage } from '../Message/SendBusMessage';
import { WebSocketClient } from '@gohorse/npm-websocket';
import { ConnectionState } from '@gohorse/npm-core';

/**
 * Cliente de acesso ao Core.
 */
export class BusClient extends Bus {
  /**
   * Sinaliza se deve capturar mensagens SendBusMessage e enviar pelo bus.
   */
  public captureSendBusMessage = false;

  /**
   * Identificador do cliente.
   */
  public readonly id: string = sha1(Math.random().toString());

  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   * @param channel Nome do canal.
   */
  public constructor(
    private readonly webSocketClient: WebSocketClient,
    private readonly channel: string
  ) {
    super(false);

    webSocketClient.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    webSocketClient.onOpen.add(this.handleWebSocketClientOpen.bind(this));
    this.handleWebSocketClientOpen();

    Message.subscribe(SendBusMessage, this.handleSendBusMessage.bind(this));
  }

  /**
   * Enviar uma mensagem.
   * @param message Mensagem
   */
  public send(message: BusMessage): void {
    if (this.webSocketClient.state !== ConnectionState.Ready) {
      Logger.post(
        'Cannot send a message {messageType}@{messageId} because the websocket was not ready.',
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
      'Sent message {messageType}@{messageId} to channels {channels}.',
      () => ({
        channels: message.channels.map(channel => `"${channel}"`).join(', '),
        clientId: message.clientId,
        messageId: message.id,
        messageType: message.type
      }),
      LogLevel.Verbose,
      Bus.name
    );
  }

  /**
   * Handle: Mensagem do bus recebida
   */
  protected override async handleBusMessage(
    busMessage: BusMessage
  ): Promise<void> {
    await busMessage.sendAsync();
  }

  /**
   * Handle: SendBusMessage
   */
  private handleSendBusMessage(message: SendBusMessage): void {
    if (this.captureSendBusMessage) {
      this.send(message.message);
    }
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
          clientId: this.id
        },
        LogLevel.Verbose,
        BusClient.name
      );
    }
  }
}

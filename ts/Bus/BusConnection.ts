import { BusClient, BusMessagePing, SendBusMessage } from '@gohorse/npm-bus';
import { IBusMessageParse } from '@gohorse/npm-bus/js/BusMessage/IBusMessageParse';
import { ConnectionState, IConnection } from '@gohorse/npm-core';
import {
  WebSocketClient,
  WebSocketClientConfiguration
} from '@gohorse/npm-websocket';
import { Definition } from '../Definition';
import { BusChannel } from './BusChannel';
import { DomainBusMessages } from './DomainBusMessages';

/**
 * Conexão com o bus de comunicação entre as aplicações.
 */
export class BusConnection implements IConnection {
  /**
   * Evento: conexão fechada
   */
  public readonly onClose: Set<() => void> = new Set<() => void>();

  /**
   * Evento: conexão aberta
   */
  public readonly onOpen: Set<() => void> = new Set<() => void>();

  /**
   * Cliente de acesso ao Bus.
   */
  private readonly busClient: BusClient;

  /**
   * Intervalo entre o PING para o servidor.
   */
  private readonly pingIntervalInSeconds: number;

  /**
   * Cliente WebSocket.
   */
  private readonly webSocketClient: WebSocketClient;

  /**
   * Construtor.
   * @param websocketConfiguration Configuração para conectar no websocket.
   * @param channel Canal de inscrição.
   * @param messagesTypes Mensagens usadas no Bus.
   * @param pingIntervalInSeconds Intervalo entre o PING para o servidor.
   */
  public constructor(
    websocketConfiguration: WebSocketClientConfiguration,
    channel: BusChannel,
    messagesTypes: IBusMessageParse[] = [],
    pingIntervalInSeconds?: number | null
  ) {
    this.webSocketClient = new WebSocketClient(websocketConfiguration);
    this.webSocketClient.onOpen.add(this.webSocketClientOnOpen.bind(this));
    this.webSocketClient.onClose.add(this.webSocketClientOnClose.bind(this));

    this.busClient = new BusClient(this.webSocketClient, channel);
    this.busClient.captureSendBusMessage = true;

    this.pingIntervalInSeconds =
      pingIntervalInSeconds ??
      Definition.DEFAULT_INTERVAL_BETWEEN_PING_TO_SERVER_IN_SECONDS;

    DomainBusMessages.attach(messagesTypes);

    void this.pingToServer();
  }

  /**
   * Identificador do cliente da conexão.
   */
  public get clientId(): string {
    return this.busClient.id;
  }

  /**
   * Estado da conexão.
   */
  public get state(): ConnectionState {
    return this.webSocketClient.state;
  }

  /**
   * Fecha a conexão.
   */
  public async close(): Promise<void> {
    return this.webSocketClient.close();
  }

  /**
   * Abre a conexão.
   */
  public async open(): Promise<void> {
    return this.webSocketClient.open();
  }

  /**
   * Envia um PING ao servidor para sinaliza conexão ativa.
   */
  private async pingToServer(): Promise<void> {
    if (this.state === ConnectionState.Ready) {
      await new SendBusMessage(new BusMessagePing(this.clientId)).sendAsync();
    }
    setTimeout(
      this.pingToServer.bind(this),
      this.pingIntervalInSeconds * Definition.ONE_SECOND_IN_MILLISECOND
    );
  }

  /**
   * Evento: WebSocketClient.OnClose
   * @param client cliente do websocket
   */
  private webSocketClientOnClose(client: WebSocketClient): void {
    this.onClose.forEach(onClose => onClose());
  }

  /**
   * Evento: WebSocketClient.OnOpen
   * @param client cliente do websocket
   */
  private webSocketClientOnOpen(client: WebSocketClient): void {
    this.onOpen.forEach(onOpen => onOpen());
  }
}

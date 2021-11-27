import { BusClient } from "../../Bus/BusClient";
import { ConnectionState } from "../../Core/Connection/ConnectionState";
import { IConnection } from "../../Core/Connection/IConnection";
import { WebSocketClient } from "../../WebSocket/WebSocketClient";
import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

import { BusChannel } from "./BusChannel";
import { DomainBusMessages } from "./DomainBusMessages";

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
   * Cliente WebSocket.
   */
  private readonly webSocketClient: WebSocketClient;

  /**
   * Construtor.
   * @param websocketConfiguration Configuração para conectar no websocket.
   * @param channel Canal de inscrição.
   */
  public constructor(
    websocketConfiguration: WebSocketClientConfiguration,
    channel: BusChannel
  ) {
    this.webSocketClient = new WebSocketClient(websocketConfiguration);
    this.webSocketClient.onOpen.add(this.webSocketClientOnOpen.bind(this));
    this.webSocketClient.onClose.add(this.webSocketClientOnClose.bind(this));

    this.busClient = new BusClient(this.webSocketClient, channel);
    this.busClient.captureSendBusMessage = true;

    DomainBusMessages.attach();
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
   * Evento: WebSocketClient.OnClose
   * @param client cliente do websocket
   */
  private webSocketClientOnClose(client: WebSocketClient): void {
    this.onClose.forEach((onClose) => onClose());
  }

  /**
   * Evento: WebSocketClient.OnOpen
   * @param client cliente do websocket
   */
  private webSocketClientOnOpen(client: WebSocketClient): void {
    this.onOpen.forEach((onOpen) => onOpen());
  }
}

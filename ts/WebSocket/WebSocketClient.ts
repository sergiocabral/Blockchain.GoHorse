import { InvalidExecutionError, Logger, LogLevel } from "@sergiocabral/helper";
import { WebSocket } from "ws";

import { BasicProtocol } from "./Protocol/BasicProtocol";
import { IProtocol } from "./Protocol/IProtocol";
import { WebSocketClientConfiguration } from "./WebSocketClientConfiguration";

/**
 * Cliente WebSocket.
 */
export class WebSocketClient {
  /**
   * Evento: o cliente fechou.
   */
  public readonly onClose: Set<(client: WebSocketClient) => void> = new Set<
    (client: WebSocketClient) => void
  >();

  /**
   * Evento: um erro ocorreu.
   */
  public readonly onError: Set<
    (error: Error, client: WebSocketClient) => void
  > = new Set<(error: Error, client: WebSocketClient) => void>();

  /**
   * Evento: mensagem recebida.
   */
  public readonly onMessage: Set<
    (message: string, client: WebSocketClient) => void
  > = new Set<(message: string, client: WebSocketClient) => void>();

  /**
   * Evento: o cliente abriu uma conexão
   */
  public readonly onOpen: Set<(client: WebSocketClient) => void> = new Set<
    (client: WebSocketClient) => void
  >();

  /**
   * Cliente websocket.
   */
  private clientValue?: WebSocket;

  /**
   * Configuração.
   */
  private readonly configuration: WebSocketClientConfiguration;

  /**
   * Protocolo de comunicação sobre websocket.
   */
  private readonly protocol: IProtocol;

  /**
   * Construtor.
   * @param configuration Configuração.
   * @param protocol Protocolo de comunicação sobre websocket.
   */
  public constructor(
    configuration: WebSocketClientConfiguration | WebSocket,
    protocol: new (client: WebSocketClient) => IProtocol = BasicProtocol
  ) {
    this.protocol = new protocol(this);
    this.protocol.onMessageReceived.push(
      this.handleProtocolMessageReceived.bind(this)
    );

    if (configuration instanceof WebSocket) {
      this.configuration = new WebSocketClientConfiguration();
      this.client = configuration;
      this.attachEvents(this.client);
    } else {
      this.configuration = configuration;
    }
  }

  /**
   * Sinaliza se a instância foi iniciada.
   */
  public get opened(): boolean {
    return this.clientValue !== undefined;
  }

  /**
   * Cliente websocket.
   */
  private get client(): WebSocket {
    if (this.clientValue === undefined) {
      throw new InvalidExecutionError("Websocket client is not opened.");
    }

    return this.clientValue;
  }

  /**
   * Cliente websocket.
   */
  private set client(value: WebSocket | undefined) {
    if (this.clientValue !== undefined && value !== undefined) {
      throw new InvalidExecutionError("Websocket client already opened.");
    }
    this.clientValue = value;
  }

  /**
   * Encerrar.
   * @param code Código do fechamento.
   * @param reason Motivo do fechamento.
   */
  public close(code?: number, reason?: string): void {
    this.client.close(code, reason);
  }

  /**
   * Iniciar.
   */
  public open(): void {
    const url = `${this.configuration.protocol}://${this.configuration.server}:${this.configuration.port}`;
    this.client = new WebSocket(url);

    this.attachEvents(this.client);

    Logger.post(
      "Websocket client trying to connect to {url}.",
      { url },
      LogLevel.Debug,
      WebSocketClient.name
    );
  }

  /**
   * Envia uma mensagem
   * @param message Mensagem.
   * @param raw Envia uma mensagem direta sem passar pelo protocolo.
   */
  public send(message: string, raw?: "raw"): void {
    if (raw) {
      this.client.send(message);
    } else {
      this.protocol.transmit(message);
    }
  }

  /**
   * Associa os eventos a um cliente websocket.
   * @param instance Cliente websocket
   */
  private attachEvents(instance: WebSocket): void {
    instance.on("open", this.handleClientOpen.bind(this));
    instance.on("close", this.handleClientClose.bind(this));
    instance.on("error", this.handleClientError.bind(this));
    instance.on("message", this.handleClientMessage.bind(this));
  }

  /**
   * Handle: ao finalizar a conexão.
   */
  private handleClientClose(): void {
    this.client = undefined;

    Logger.post(
      "Websocket client connection closed.",
      undefined,
      LogLevel.Debug,
      WebSocketClient.name
    );

    this.onClose.forEach((onClientClose) => onClientClose(this));
  }

  /**
   * Handle: ao ocorrer um erro.
   */
  private handleClientError(error: Error): void {
    Logger.post(
      "Websocket client error: {0}",
      error.message,
      LogLevel.Debug,
      WebSocketClient.name
    );

    this.onError.forEach((onClientError) => onClientError(error, this));
  }

  /**
   * Handle: ao receber uma mensagem.
   */
  private handleClientMessage(...args: unknown[]): void {
    const packet = String(args[0] ?? "");
    this.protocol.receive(packet);
  }

  /**
   * Handle: ao iniciar a conexão.
   */
  private handleClientOpen(): void {
    Logger.post(
      "Websocket client has established a connection.",
      undefined,
      LogLevel.Debug,
      WebSocketClient.name
    );

    this.onOpen.forEach((onClientOpen) => onClientOpen(this));
  }

  /**
   * Handle: recebe uma mensagem pelo protocol.
   */
  private handleProtocolMessageReceived(message: string): void {
    this.onMessage.forEach((onMessage) => onMessage(message, this));
  }
}

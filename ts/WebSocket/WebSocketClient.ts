import {
  HelperObject,
  InvalidExecutionError,
  Logger,
  LogLevel,
} from "@sergiocabral/helper";
import { WebSocket } from "ws";

import { ConnectionState } from "../Core/Connection/ConnectionState";
import { IConnection } from "../Core/Connection/IConnection";

import { BasicProtocol } from "./Protocol/BasicProtocol";
import { IProtocol } from "./Protocol/IProtocol";
import { WebSocketClientConfiguration } from "./WebSocketClientConfiguration";

/**
 * Cliente WebSocket.
 */
export class WebSocketClient implements IConnection {
  /**
   * Evento: o cliente fechou.
   */
  public readonly onClose: Set<
    (client: WebSocketClient, code: number, reason: string) => void
  > = new Set<
    (client: WebSocketClient, code: number, reason: string) => void
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
   * Estado da conexão.
   */
  public get state(): ConnectionState {
    if (this.clientValue?.readyState === 1) {
      return ConnectionState.Ready;
    }

    if (this.clientValue !== undefined) {
      return ConnectionState.Connecting;
    }

    return ConnectionState.Closed;
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
  public async close(code?: number, reason?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let resolved = false;

      this.client.on("error", (error) => {
        if (resolved) {
          return;
        }
        resolved = true;
        reject(error);
      });

      this.client.on("close", () => {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve();
      });

      this.client.close(code, reason);
    });
  }

  /**
   * Iniciar.
   */
  public async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      let errorAggregation: Error | undefined;

      const url = `${this.configuration.protocol}://${this.configuration.server}:${this.configuration.port}`;
      this.client = new WebSocket(url);

      this.client.on("error", (error) => {
        if (resolved) {
          return;
        }

        if (errorAggregation) {
          HelperObject.setProperty(error, "innerError", errorAggregation);
        }
        errorAggregation = error;
      });

      this.client.on("close", () => {
        if (resolved) {
          return;
        }
        resolved = true;
        this.client = undefined;
        reject(errorAggregation);
      });

      this.client.on("open", () => {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve();
      });

      this.attachEvents(this.client);

      Logger.post(
        "Websocket client trying to connect to {url}.",
        { url },
        LogLevel.Debug,
        WebSocketClient.name
      );
    });
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
  private handleClientClose(code: number, reasonBuffer: Buffer): void {
    this.client = undefined;
    const reason = reasonBuffer.toString();

    Logger.post(
      'Websocket client connection closed with code "{code}" and reason "{reason}".',
      { code, reason },
      LogLevel.Debug,
      WebSocketClient.name
    );

    this.onClose.forEach((onClientClose) => onClientClose(this, code, reason));
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

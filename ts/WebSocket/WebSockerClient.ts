import {
  InvalidExecutionError,
  Logger,
  LogLevel,
  Message,
} from "@sergiocabral/helper";
import { WebSocket } from "ws";

import { WebSocketClientClosed } from "./Message/WebSocketClientClosed";
import { WebSocketClientError } from "./Message/WebSocketClientError";
import { WebSocketClientMessageReceived } from "./Message/WebSocketClientMessageReceived";
import { WebSocketClientMessageSend } from "./Message/WebSocketClientMessageSend";
import { WebSocketClientOpened } from "./Message/WebSocketClientOpened";
import { BasicProtocol } from "./Protocol/BasicProtocol";
import { IProtocol } from "./Protocol/IProtocol";
import { WebSocketClientConfiguration } from "./WebSocketClientConfiguration";

/**
 * Cliente WebSocket.
 */
export class WebSocketClient {
  /**
   * Configuração.
   */
  private readonly configuration: WebSocketClientConfiguration;

  /**
   * Cliente websocket.
   */
  private instance?: WebSocket;

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
    protocol: IProtocol | (new () => IProtocol) = BasicProtocol
  ) {
    this.protocol = typeof protocol === "object" ? protocol : new protocol();
    if (configuration instanceof WebSocket) {
      this.configuration = new WebSocketClientConfiguration();
      this.instance = configuration;
      this.attachEvents(this.instance);
    } else {
      this.configuration = configuration;
    }
    Message.subscribe(
      WebSocketClientMessageSend,
      this.handleWebSocketClientMessageSend.bind(this)
    );
  }

  /**
   * Sinaliza se está iniciado.
   */
  public get started(): boolean {
    return this.instance !== undefined;
  }

  /**
   * Iniciar.
   */
  public start(): void {
    if (this.instance !== undefined) {
      throw new InvalidExecutionError("Websocket client already started.");
    }

    const url = `${this.configuration.protocol}://${this.configuration.server}:${this.configuration.port}`;
    this.instance = new WebSocket(url);

    this.attachEvents(this.instance);

    Logger.post(
      "Websocket client trying to connect to {url}.",
      { url },
      LogLevel.Debug,
      WebSocketClient.name
    );
  }

  /**
   * Encerrar.
   */
  public stop(): void {
    if (this.instance === undefined) {
      throw new InvalidExecutionError("Websocket client was not started.");
    }

    this.instance.close();
    this.instance = undefined;
  }

  /**
   * Associa os eventos a um cliente websocket.
   * @param instance Cliente websocket
   */
  private attachEvents(instance: WebSocket): void {
    instance.on("open", this.onClientOpen.bind(this));
    instance.on("close", this.onClientClose.bind(this));
    instance.on("error", this.onClientError.bind(this));
    instance.on("message", this.onClientMessage.bind(this));
  }

  /**
   * subscribe: WebSocketClientMessageSend
   */
  private handleWebSocketClientMessageSend(
    message: WebSocketClientMessageSend
  ): void {
    if (!Object.is(this, message.instance) || !this.instance) {
      return;
    }

    this.instance.send(message.message);

    message.delivered = true;

    Logger.post(
      "Websocket client send a message: {0}",
      message.message,
      LogLevel.Verbose,
      WebSocketClient.name
    );
  }

  /**
   * Handle: ao finalizar a conexão.
   */
  private onClientClose(): void {
    this.instance = undefined;

    Logger.post(
      "Websocket client connection closed.",
      undefined,
      LogLevel.Debug,
      WebSocketClient.name
    );

    void new WebSocketClientClosed(this).sendAsync();
  }

  /**
   * Handle: ao ocorrer um erro.
   */
  private onClientError(error: Error): void {
    Logger.post(
      "Websocket client error: {0}",
      error.message,
      LogLevel.Debug,
      WebSocketClient.name
    );

    void new WebSocketClientError(this, error).sendAsync();
  }

  /**
   * Handle: ao receber uma mensagem.
   */
  private onClientMessage(...args: unknown[]): void {
    const message = String(args[0] ?? "");

    Logger.post(
      "Websocket client received message: {0}",
      message,
      LogLevel.Verbose,
      WebSocketClient.name
    );

    void new WebSocketClientMessageReceived(this, message).sendAsync();
  }

  /**
   * Handle: ao iniciar a conexão.
   */
  private onClientOpen(): void {
    Logger.post(
      "Websocket client has established a connection.",
      undefined,
      LogLevel.Debug,
      WebSocketClient.name
    );

    void new WebSocketClientOpened("output", this).sendAsync();
  }
}

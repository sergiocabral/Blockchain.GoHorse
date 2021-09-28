import {
  Logger,
  LogLevel,
  Message,
  NotReadyError,
} from "@sergiocabral/helper";
import { WebSocket } from "ws";

import { BasicProtocol } from "../Protocol/BasicProtocol";
import { IProtocol } from "../Protocol/IProtocol";
import { WebSocketBase } from "../WebSocketBase";

import { WebSocketClientClosed } from "./Message/WebSocketClientClosed";
import { WebSocketClientError } from "./Message/WebSocketClientError";
import { WebSocketClientMessageReceived } from "./Message/WebSocketClientMessageReceived";
import { WebSocketClientOpened } from "./Message/WebSocketClientOpened";
import { WebSocketClientSendMessage } from "./Message/WebSocketClientSendMessage";
import { WebSocketClientConfiguration } from "./WebSocketClientConfiguration";

/**
 * Inicia e gerencia uma conexão com um servidor websocket
 */
export class WebSocketClient extends WebSocketBase<WebSocket> {
  /**
   * Construtor.
   * @param configuration JSON de configuração.
   * @param protocol Protocolo de comunicação.
   */
  public constructor(
    private readonly configuration: WebSocketClientConfiguration,
    protocol: new () => IProtocol = BasicProtocol
  ) {
    super(protocol);
    Message.subscribe(
      WebSocketClientSendMessage,
      this.handleWebSocketClientSendMessage.bind(this)
    );
  }

  /**
   * Inicia o servidor.
   */
  public start(): void {
    const url = `${this.configuration.protocol}://${this.configuration.server}:${this.configuration.port}`;
    this.instance = new WebSocket(url);

    this.instance.on("open", this.onConnection.bind(this));
    this.instance.on("error", this.onError.bind(this));
    this.instance.on("message", this.onMessage.bind(this));
    this.instance.on("close", this.onClose.bind(this));

    Logger.post(
      "Websocket client connected to {url}.",
      { url },
      LogLevel.Debug,
      WebSocketClient.name
    );
  }

  /**
   * Para o servidor.
   */
  public stop(): void {
    this.instance.close();

    Logger.post(
      "Websocket client stopped.",
      undefined,
      LogLevel.Debug,
      WebSocketClient.name
    );
  }

  /**
   * Handle: WebSocketClientSendMessage
   */
  private handleWebSocketClientSendMessage(
    message: WebSocketClientSendMessage
  ): void {
    if (message.instance !== this) {
      return;
    }
    if (this.instance === undefined) {
      throw new NotReadyError("Websocket client was not started.");
    }
    this.instance.send(message.message);
  }

  /**
   * Handle: Conexão finalizada.
   * @param code Código.
   * @param reason Mensagem.
   */
  private onClose(code: number, reason: Buffer): void {
    Logger.post(
      'Websocket client connection closed. Code: {code}, Reason: "{reason}".',
      { code, reason },
      LogLevel.Debug,
      WebSocketClient.name
    );

    void new WebSocketClientClosed(this, code, reason.toString()).sendAsync();
  }

  /**
   * Handle: ao iniciar a conexão.
   */
  private onConnection(): void {
    Logger.post(
      "Websocket client connection opened.",
      undefined,
      LogLevel.Debug,
      WebSocketClient.name
    );

    void new WebSocketClientOpened(this).sendAsync();
  }

  /**
   * Handle: Erro na conexão.
   * @param error Erro
   */
  private onError(error: Error): void {
    Logger.post(
      "Websocket client connection error: {error}",
      { error: error.message },
      LogLevel.Debug,
      WebSocketClient.name
    );

    void new WebSocketClientError(this, error).sendAsync();
  }

  /**
   * Handle: Mensagem recebida.
   * @param messages Mensagens.
   */
  private onMessage(...messages: unknown[]): void {
    const message = String(messages[0]);

    Logger.post(
      "Websocket client connection received message: {message}",
      { message },
      LogLevel.Debug,
      WebSocketClient.name
    );

    void new WebSocketClientMessageReceived(this, message).sendAsync();
  }
}

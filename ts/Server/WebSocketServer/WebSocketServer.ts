import {
  EmptyError,
  InvalidExecutionError,
  Logger,
  LogLevel,
} from "@sergiocabral/helper";
import { IncomingMessage } from "http";
import { Server, WebSocket } from "ws";

import { WebSocketEventMessage } from "./Message/WebSocketEventMessage";
import { WebSocketConfiguration } from "./WebSocketConfiguration";
import { WebSocketEvent } from "./WebSocketEvent";

/**
 * Inicia e gerencia um servidor websocket.
 */
export class WebSocketServer {
  /**
   * Identificador desta classe.
   */
  private static readonly identifier: symbol = Symbol();

  /**
   * Retorna a instância do servidor associada a uma conexão.
   * @param webSocket Conexão.
   */
  private static getServerInstance(webSocket: WebSocket): WebSocketServer {
    const webSocketAsRecord = webSocket as unknown as Record<symbol, unknown>;
    const instance = webSocketAsRecord[WebSocketServer.identifier];

    if (!(instance instanceof WebSocketServer)) {
      throw new EmptyError(
        "Expected WebSocketServer property in WebSocket connection."
      );
    }

    return instance;
  }

  /**
   * Vincula a instância do servidor a uma conexão.
   * @param webSocket Conexão.
   * @param instance Instância do servidor.
   */
  private static setServerInstance(
    webSocket: WebSocket,
    instance: WebSocketServer
  ): WebSocket {
    const webSocketAsRecord = webSocket as unknown as Record<symbol, unknown>;
    webSocketAsRecord[WebSocketServer.identifier] = instance;

    return webSocket;
  }

  /**
   * Lista de conexões com sinalização de ativa ou não.
   */
  private connections: Set<WebSocket> = new Set<WebSocket>();

  /**
   * Instância do servidor websocket.
   */
  private server?: Server;

  /**
   * Construtor.
   * @param configuration JSON de configuração.
   */
  public constructor(private readonly configuration: WebSocketConfiguration) {}

  /**
   * Inicia o servidor.
   */
  public start(): void {
    if (this.server !== undefined) {
      throw new InvalidExecutionError("Websocket already started.");
    }

    const serverOptions = {
      port: this.configuration.port,
    };
    this.server = new Server(serverOptions);

    this.server.on("connection", this.onConnection.bind(this));

    Logger.post(
      "Server started on port {port}.",
      serverOptions,
      LogLevel.Debug,
      WebSocketServer.name
    );
  }

  /**
   * Handle: ao receber uma conexão.
   * @param webSocket Conexão.
   * @param incomingMessage Mensagem.
   */
  private onConnection(
    webSocket: WebSocket,
    incomingMessage: IncomingMessage
  ): void {
    WebSocketServer.setServerInstance(webSocket, this);
    this.connections.add(webSocket);

    webSocket.on("error", this.onConnectionError);
    webSocket.on("close", this.onConnectionClose);
    webSocket.on("message", this.onConnectionMessage);

    Logger.post(
      "Connection received.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    new WebSocketEventMessage(
      this,
      webSocket,
      WebSocketEvent.Connection,
      arguments
    ).sendAsync();
  }

  /**
   * Handle: Conexão finalizada.
   * @param code Código.
   * @param reason Mensagem.
   * @private
   */
  private onConnectionClose(
    this: WebSocket,
    code: number,
    reason: Buffer
  ): void {
    const server = WebSocketServer.getServerInstance(this);
    server.connections.delete(this);

    Logger.post(
      "Connection closed. Code: {code}, Reason: \"{reason}\".",
      { code, reason },
      LogLevel.Debug,
      WebSocketServer.name
    );

    new WebSocketEventMessage(
      server,
      this,
      WebSocketEvent.Close,
      arguments
    ).sendAsync();
  }

  /**
   * Handle: Erro na conexão.
   * @private
   * @param error Error
   */
  private onConnectionError(this: WebSocket, error: Error): void {
    const server = WebSocketServer.getServerInstance(this);

    Logger.post(
      "Connection error: {error}",
      { error },
      LogLevel.Debug,
      WebSocketServer.name
    );

    new WebSocketEventMessage(
      server,
      this,
      WebSocketEvent.Error,
      arguments
    ).sendAsync();
  }

  /**
   * Handle: Conexão finalizada.
   * @private
   * @param args Argumentos recebidos.
   */
  private onConnectionMessage(this: WebSocket, ...args: unknown[]): void {
    const server = WebSocketServer.getServerInstance(this);

    Logger.post(
      "Connection received message: {message}",
      { message: args[0] },
      LogLevel.Debug,
      WebSocketServer.name
    );

    new WebSocketEventMessage(
      server,
      this,
      WebSocketEvent.Message,
      arguments
    ).sendAsync();
  }
}

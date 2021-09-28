import {
  HelperObject,
  InvalidExecutionError,
  Logger,
  LogLevel,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";
import { IncomingMessage } from "http";
import { Server, WebSocket } from "ws";

import { WebSocketServerConnectionError } from "./Message/WebSocketServerConnectionError";
import { WebSocketServerConnectionMessageReceived } from "./Message/WebSocketServerConnectionMessageReceived";
import { WebSocketServerConnectionOpened } from "./Message/WebSocketServerConnectionOpened";
import { WebSocketServerConfiguration } from "./WebSocketServerConfiguration";
import { WebSocketServerConnection } from "./WebSocketServerConnection";

/**
 * Inicia e gerencia um servidor websocket.
 */
export class WebSocketServer {
  /**
   * Lista de conexões com sinalização de ativa ou não.
   */
  private readonly connections: Set<WebSocketServerConnection> =
    new Set<WebSocketServerConnection>();

  /**
   * Instância do servidor websocket.
   */
  private server?: Server;

  /**
   * Construtor.
   * @param configuration JSON de configuração.
   */
  public constructor(
    private readonly configuration: WebSocketServerConfiguration
  ) {}

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
    const connection = new WebSocketServerConnection(this, webSocket);
    HelperObject.setProperty(
      webSocket,
      WebSocketServerConnection.name,
      connection
    );
    this.connections.add(connection);

    webSocket.on("error", this.onConnectionError);
    webSocket.on("close", this.onConnectionClose);
    webSocket.on("message", this.onConnectionMessage);

    Logger.post(
      "Connection received.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerConnectionOpened(this, connection).sendAsync();
  }

  /**
   * Handle: Conexão finalizada.
   * @param code Código.
   * @param reason Mensagem.
   */
  private onConnectionClose(
    this: WebSocket,
    code: number,
    reason: Buffer
  ): void {
    const connection = HelperObject.getProperty<WebSocketServerConnection>(
      this,
      WebSocketServerConnection.name
    );
    if (!connection) {
      throw new ShouldNeverHappenError();
    }
    connection.server.connections.delete(connection);

    Logger.post(
      'Connection closed. Code: {code}, Reason: "{reason}".',
      { code, reason },
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerConnectionOpened(
      connection.server,
      connection
    ).sendAsync();
  }

  /**
   * Handle: Erro na conexão
   * @param error Error
   */
  private onConnectionError(this: WebSocket, error: Error): void {
    const connection = HelperObject.getProperty<WebSocketServerConnection>(
      this,
      WebSocketServerConnection.name
    );
    if (!connection) {
      throw new ShouldNeverHappenError();
    }

    Logger.post(
      "Connection error: {error}",
      { error },
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerConnectionError(
      connection.server,
      connection,
      error
    ).sendAsync();
  }

  /**
   * Handle: Conexão finalizada.
   * @param messages Mensagens.
   */
  private onConnectionMessage(this: WebSocket, ...messages: unknown[]): void {
    const message = String(messages[0]);
    const connection = HelperObject.getProperty<WebSocketServerConnection>(
      this,
      WebSocketServerConnection.name
    );
    if (!connection) {
      throw new ShouldNeverHappenError();
    }

    Logger.post(
      "Connection received message: {message}",
      { message },
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerConnectionMessageReceived(
      connection.server,
      connection,
      message
    ).sendAsync();
  }
}

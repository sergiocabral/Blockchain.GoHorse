import {
  HelperObject,
  InvalidExecutionError,
  Logger,
  LogLevel,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";
import { IncomingMessage } from "http";
import { Server, WebSocket } from "ws";

import { WebSocketServerClosed } from "./Message/WebSocketServerClosed";
import { WebSocketServerError } from "./Message/WebSocketServerError";
import { WebSocketServerMessageReceived } from "./Message/WebSocketServerMessageReceived";
import { WebSocketServerOpened } from "./Message/WebSocketServerOpened";
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
      throw new InvalidExecutionError("Websocket server already started.");
    }

    const serverOptions = {
      port: this.configuration.port,
    };
    this.server = new Server(serverOptions);

    this.server.on("connection", this.onConnection.bind(this));

    Logger.post(
      "Websocket server started on port {port}.",
      serverOptions,
      LogLevel.Debug,
      WebSocketServer.name
    );
  }

  /**
   * Para o servidor.
   */
  public stop(): void {
    if (this.server === undefined) {
      throw new InvalidExecutionError("Websocket server was not started.");
    }

    for (const connection of this.connections) {
      connection.close();
    }
    this.server.close();

    Logger.post(
      "Websocket server stopped.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );
  }

  /**
   * Handle: ao iniciar a conexão.
   */
  private onConnection(
    webSocket: WebSocket,
    incomingMessage: IncomingMessage
  ): void {
    const connection = new WebSocketServerConnection(
      this,
      webSocket,
      incomingMessage
    );
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
      "Websocket server connection opened.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerOpened(connection).sendAsync();
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
      'Websocket server connection closed. Code: {code}, Reason: "{reason}".',
      { code, reason },
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerClosed(
      connection,
      code,
      reason.toString()
    ).sendAsync();
  }

  /**
   * Handle: Erro na conexão.
   * @param error Erro
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
      "Websocket server connection error: {error}",
      { error: error.message },
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerError(connection, error).sendAsync();
  }

  /**
   * Handle: Mensagem recebida.
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
      "Websocket server connection received message: {message}",
      { message },
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerMessageReceived(connection, message).sendAsync();
  }
}

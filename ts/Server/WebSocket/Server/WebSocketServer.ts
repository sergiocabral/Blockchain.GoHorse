import {
  HelperObject,
  Logger,
  LogLevel,
  Message,
  NotReadyError,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";
import { IncomingMessage } from "http";
import { Server, WebSocket } from "ws";

import { BasicProtocol } from "../Protocol/BasicProtocol";
import { IProtocol } from "../Protocol/IProtocol";
import { WebSocketBase } from "../WebSocketBase";

import { WebSocketServerClosed } from "./Message/WebSocketServerClosed";
import { WebSocketServerError } from "./Message/WebSocketServerError";
import { WebSocketServerMessageReceived } from "./Message/WebSocketServerMessageReceived";
import { WebSocketServerOpened } from "./Message/WebSocketServerOpened";
import { WebSocketServerSendMessage } from "./Message/WebSocketServerSendMessage";
import { WebSocketServerConfiguration } from "./WebSocketServerConfiguration";
import { WebSocketServerConnection } from "./WebSocketServerConnection";

/**
 * Inicia e gerencia um servidor websocket.
 */
export class WebSocketServer extends WebSocketBase<Server> {
  /**
   * Lista de conexões com sinalização de ativa ou não.
   */
  private readonly connections: Set<WebSocketServerConnection> =
    new Set<WebSocketServerConnection>();

  /**
   * Construtor.
   * @param configuration JSON de configuração.
   * @param protocol Protocolo de comunicação.
   */
  public constructor(
    private readonly configuration: WebSocketServerConfiguration,
    protocol: new () => IProtocol = BasicProtocol
  ) {
    super(protocol);
    Message.subscribe(
      WebSocketServerSendMessage,
      this.handleWebSocketServerSendMessage.bind(this)
    );
  }

  /**
   * Inicia o servidor.
   */
  public start(): void {
    const serverOptions = {
      port: this.configuration.port,
    };
    this.instance = new Server(serverOptions);

    this.instance.on("connection", this.onConnection.bind(this));

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
    this.instance.close();
    for (const connection of this.connections) {
      connection.close();
    }

    Logger.post(
      "Websocket server stopped.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );
  }

  /**
   * Handle: WebSocketServerSendMessage
   */
  private handleWebSocketServerSendMessage(
    message: WebSocketServerSendMessage
  ): void {
    if (message.instance !== this) {
      return;
    }
    if (this.instance === undefined) {
      throw new NotReadyError("Websocket server was not started.");
    }
    if (message.destination === undefined) {
      this.connections.forEach((connection) =>
        connection.send(message.message)
      );
    } else if (this.connections.has(message.destination)) {
      message.destination.send(message.message);
    }
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

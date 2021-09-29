import {
  InvalidExecutionError,
  Logger,
  LogLevel,
  Message,
} from "@sergiocabral/helper";
import { Server, WebSocket } from "ws";

import { WebSocketClientMessageSend } from "./Message/WebSocketClientMessageSend";
import { WebSocketClientOpened } from "./Message/WebSocketClientOpened";
import { WebSocketServerClosed } from "./Message/WebSocketServerClosed";
import { WebSocketServerError } from "./Message/WebSocketServerError";
import { WebSocketServerMessageSend } from "./Message/WebSocketServerMessageSend";
import { WebSocketServerOpened } from "./Message/WebSocketServerOpened";
import { BasicProtocol } from "./Protocol/BasicProtocol";
import { IProtocol } from "./Protocol/IProtocol";
import { WebSocketClient } from "./WebSockerClient";
import { WebSocketServerConfiguration } from "./WebSocketServerConfiguration";

/**
 * Servidor WebSocket.
 */
export class WebSocketServer {
  /**
   * Lista de clientes conectados.
   */
  private readonly clients: Set<WebSocketClient> = new Set<WebSocketClient>();

  /**
   * Servidor websocket.
   */
  private instance?: Server;

  /**
   * Construtor.
   * @param configuration Configuração.
   * @param protocol Protocolo de comunicação sobre websocket.
   */
  public constructor(
    private readonly configuration: WebSocketServerConfiguration,
    private readonly protocol: new (
      client: WebSocketClient
    ) => IProtocol = BasicProtocol
  ) {
    Message.subscribe(
      WebSocketServerMessageSend,
      this.handleWebSocketServerMessageSend.bind(this)
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
      throw new InvalidExecutionError("Websocket server already started.");
    }

    this.instance = new Server({
      port: this.configuration.port,
    });

    this.attachEvents(this.instance);

    Logger.post(
      "Websocket server trying to start on port {port}.",
      { port: this.configuration.port },
      LogLevel.Debug,
      WebSocketServer.name
    );
  }

  /**
   * Encerrar.
   */
  public stop(): void {
    if (this.instance === undefined) {
      throw new InvalidExecutionError("Websocket server was not started.");
    }

    for (const client of this.clients) {
      if (client.started) {
        client.stop();
      }
    }

    this.instance.close();
    this.instance = undefined;
  }

  /**
   * Associa os eventos a um cliente websocket.
   * @param instance Servidor websocket.
   */
  private attachEvents(instance: Server): void {
    instance.on("listening", this.onServerOpen.bind(this));
    instance.on("connection", this.onServerConnection.bind(this));
    instance.on("close", this.onServerClose.bind(this));
    instance.on("error", this.onServerError.bind(this));
  }

  /**
   * subscribe: WebSocketServerMessageSend
   */
  private handleWebSocketServerMessageSend(
    message: WebSocketServerMessageSend
  ): void {
    if (!Object.is(this, message.instance) || !this.instance) {
      return;
    }

    message.clients = 0;
    for (const client of this.clients) {
      void new WebSocketClientMessageSend(client, message.message).sendAsync();
      message.clients += 1;
    }

    message.delivered = true;

    Logger.post(
      "Websocket server sent a broadcast message to {clients} clients: {message}",
      { clients: message.clients, message: message.message },
      LogLevel.Verbose,
      WebSocketServer.name
    );
  }

  /**
   * Handle: ao finalizar.
   */
  private onServerClose(): void {
    this.instance = undefined;

    Logger.post(
      "Websocket server closed.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerClosed(this).sendAsync();
  }

  /**
   * Handle: ao iniciar a conexão.
   */
  private onServerConnection(webSocket: WebSocket): void {
    const client = new WebSocketClient(webSocket, this.protocol);
    this.clients.add(client);

    webSocket.on("close", () => this.clients.delete(client));

    Logger.post(
      "Websocket server received a client connection.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketClientOpened("input", client).sendAsync();
  }

  /**
   * Handle: ao ocorrer um erro.
   */
  private onServerError(error: Error): void {
    Logger.post(
      "Websocket server error: {0}",
      error.message,
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerError(this, error).sendAsync();
  }

  /**
   * Handle: ao iniciar.
   */
  private onServerOpen(): void {
    Logger.post(
      "Websocket server opened for connection.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    void new WebSocketServerOpened(this).sendAsync();
  }
}

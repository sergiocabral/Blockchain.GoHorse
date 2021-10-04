import { InvalidExecutionError, Logger, LogLevel } from "@sergiocabral/helper";
import { Server, WebSocket } from "ws";

import { BasicProtocol } from "./Protocol/BasicProtocol";
import { IProtocol } from "./Protocol/IProtocol";
import { WebSocketClient } from "./WebSocketClient";
import { WebSocketServerConfiguration } from "./WebSocketServerConfiguration";

/**
 * Servidor WebSocket.
 */
export class WebSocketServer {
  /**
   * Lista de clientes conectados.
   */
  public readonly clients: Set<WebSocketClient> = new Set<WebSocketClient>();
  /**
   * Evento: o servidor fechou.
   */
  public readonly onClose: Set<(server: WebSocketServer) => void> = new Set<
    (server: WebSocketServer) => void
  >();

  /**
   * Evento: uma conexão de cliente foi recebida.
   */
  public readonly onConnection: Set<
    (client: WebSocketClient, server: WebSocketServer) => void
  > = new Set<(client: WebSocketClient, server: WebSocketServer) => void>();

  /**
   * Evento: um erro ocorreu.
   */
  public readonly onError: Set<
    (error: Error, server: WebSocketServer) => void
  > = new Set<(error: Error, server: WebSocketServer) => void>();

  /**
   * Evento: o servidor está aberto para conexões.
   */
  public readonly onOpen: Set<(server: WebSocketServer) => void> = new Set<
    (server: WebSocketServer) => void
  >();

  /**
   * Servidor websocket.
   */
  private serverValue?: Server;

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
  ) {}

  /**
   * Sinaliza se a instância foi iniciada.
   */
  public get started(): boolean {
    return this.serverValue !== undefined;
  }

  /**
   * Servidor websocket.
   */
  private get server(): Server {
    if (this.serverValue === undefined) {
      throw new InvalidExecutionError("Websocket server is not started.");
    }

    return this.serverValue;
  }

  /**
   * Servidor websocket.
   */
  private set server(value: Server | undefined) {
    if (this.serverValue !== undefined && value !== undefined) {
      throw new InvalidExecutionError("Websocket server already started.");
    }
    this.serverValue = value;
  }

  /**
   * Envia uma mensagem broadcast para todos os clientes.
   * @param message Mensagem
   * @returns Total de clientes que receberam a mensagem
   */
  public send(message: string): number {
    let clients = 0;
    for (const client of this.clients) {
      client.send(message);
      clients += 1;
    }

    Logger.post(
      "Websocket server sent a broadcast message to {clients} clients: {message}",
      { clients, message },
      LogLevel.Verbose,
      WebSocketServer.name
    );

    return clients;
  }

  /**
   * Iniciar.
   */
  public start(): void {
    this.server = new Server({
      port: this.configuration.port,
    });

    this.attachEvents(this.server);

    Logger.post(
      "Websocket server trying to start on port {port}.",
      { port: this.configuration.port },
      LogLevel.Debug,
      WebSocketServer.name
    );
  }

  /**
   * Encerrar.
   * @param code Código do fechamento.
   * @param reason Motivo do fechamento.
   */
  public stop(code?: number, reason?: string): void {
    for (const client of this.clients) {
      if (client.started) {
        client.stop(code, reason);
      }
    }

    this.server.close();
  }

  /**
   * Associa os eventos a um cliente websocket.
   * @param instance Servidor websocket.
   */
  private attachEvents(instance: Server): void {
    instance.on("listening", this.handleServerOpen.bind(this));
    instance.on("connection", this.handleServerConnection.bind(this));
    instance.on("close", this.handleServerClose.bind(this));
    instance.on("error", this.handleServerError.bind(this));
  }

  /**
   * Handle: ao finalizar.
   */
  private handleServerClose(): void {
    this.server = undefined;

    Logger.post(
      "Websocket server closed.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    this.onClose.forEach((onServerClose) => onServerClose(this));
  }

  /**
   * Handle: ao iniciar a conexão.
   */
  private handleServerConnection(webSocket: WebSocket): void {
    const client = new WebSocketClient(webSocket, this.protocol);
    this.clients.add(client);

    webSocket.on("close", () => this.clients.delete(client));

    Logger.post(
      "Websocket server received a client connection.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    this.onConnection.forEach((onServerConnection) =>
      onServerConnection(client, this)
    );
  }

  /**
   * Handle: ao ocorrer um erro.
   */
  private handleServerError(error: Error): void {
    Logger.post(
      "Websocket server error: {0}",
      error.message,
      LogLevel.Debug,
      WebSocketServer.name
    );

    this.onError.forEach((onServerError) => onServerError(error, this));
  }

  /**
   * Handle: ao iniciar.
   */
  private handleServerOpen(): void {
    Logger.post(
      "Websocket server opened for connection.",
      undefined,
      LogLevel.Debug,
      WebSocketServer.name
    );

    this.onOpen.forEach((onServerOpen) => onServerOpen(this));
  }
}

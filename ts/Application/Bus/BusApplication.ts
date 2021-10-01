import { BusServer } from "../../Bus/BusServer";
import { Application } from "../../Core/Application";
import { WebSocketServer } from "../../WebSocket/WebSocketServer";

import { BusConfiguration } from "./BusConfiguration";

/**
 * Barramento de mensagens para comunicação entre as aplicações.
 */
export class BusApplication extends Application<BusConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = BusConfiguration;

  /**
   * Roteador de mensagem via websocket.
   */
  private readonly busMessageRouter: BusServer;

  /**
   * Servidor websocket.
   */
  private readonly webSocketServer: WebSocketServer;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.webSocketServer = new WebSocketServer(
      this.configuration.webSocketServer
    );
    this.busMessageRouter = new BusServer(this.webSocketServer);
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketServer.start();
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    if (this.webSocketServer.started) {
      this.webSocketServer.stop();
    }
  }
}

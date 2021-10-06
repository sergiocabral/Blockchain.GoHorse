import { clearInterval } from "timers";

import { BusMessageText } from "../../Bus/BusMessage/BusMessageText";
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
   * Servidor do Bus.
   */
  private readonly busServer: BusServer;

  /**
   * Timer
   */
  private timer: NodeJS.Timer = 0 as unknown as NodeJS.Timer;

  /**
   * Servidor WebSocket.
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
    this.busServer = new BusServer(this.webSocketServer);
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketServer.start();
    const interval = 15000;
    // TODO: Isso pode?
    this.timer = setInterval(() => {
      this.busServer.send(new BusMessageText("ALL"));
    }, interval);
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    if (this.webSocketServer.started) {
      this.webSocketServer.stop();
    }
    clearInterval(this.timer);
  }
}

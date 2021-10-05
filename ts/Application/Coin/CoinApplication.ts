import { BusClient } from "../../Bus/BusClient";
import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../WebSocket/WebSocketClient";

import { CoinConfiguration } from "./CoinConfiguration";

/**
 * Manipulador da criptomoeda.
 */
export class CoinApplication extends Application<CoinConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = CoinConfiguration;

  /**
   * Enviador de mensagem via websocket.
   */
  private readonly busClient: BusClient;

  /**
   * Cliente websocket.
   */
  private readonly webSocketClient: WebSocketClient;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.webSocketClient = new WebSocketClient(
      this.configuration.messageBusWebSocketServer
    );
    this.busClient = new BusClient(this.webSocketClient, this.constructor.name);
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketClient.start();
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    if (this.webSocketClient.started) {
      this.webSocketClient.stop();
    }
  }
}

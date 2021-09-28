import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../Server/WebSocket/Client/WebSocketClient";

import { MinerConfiguration } from "./MinerConfiguration";

/**
 * Minerador.
 */
export class MinerApplication extends Application<MinerConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = MinerConfiguration;

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
    this.webSocketClient.stop();
  }
}

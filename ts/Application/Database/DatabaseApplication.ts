import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../Server/WebSocket/Client/WebSocketClient";

import { DatabaseConfiguration } from "./DatabaseConfiguration";

/**
 * Manipulador do banco de dados.
 */
export class DatabaseApplication extends Application<DatabaseConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = DatabaseConfiguration;

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

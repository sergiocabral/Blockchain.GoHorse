import { Application } from "../../Core/Application";
import { WebSocketServer } from "../../Server/WebSocket/Server/WebSocketServer";

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
   * Construtor.
   */
  public constructor() {
    super();
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    void new WebSocketServer(this.configuration.websocket).start();
  }
}

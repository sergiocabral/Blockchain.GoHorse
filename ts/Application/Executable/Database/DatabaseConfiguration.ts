import { ApplicationBusClientConfiguration } from "../../../Core/Application/ApplicationBusClientConfiguration";
import { WebSocketClientConfiguration } from "../../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do DatabaseApplication
 */
export class DatabaseConfiguration extends ApplicationBusClientConfiguration {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();
}

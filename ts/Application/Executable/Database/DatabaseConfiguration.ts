import { ApplicationConfiguration } from "../../../Core/Application/ApplicationConfiguration";
import { WebSocketClientConfiguration } from "../../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do DatabaseApplication
 */
export class DatabaseConfiguration extends ApplicationConfiguration {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();
}

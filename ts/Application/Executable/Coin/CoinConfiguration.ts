import { ApplicationConfiguration } from "../../../Core/Application/ApplicationConfiguration";
import { WebSocketClientConfiguration } from "../../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do CoinApplication
 */
export class CoinConfiguration extends ApplicationConfiguration {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();
}

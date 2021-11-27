import { ApplicationConfiguration } from "../../../Core/Application/ApplicationConfiguration";
import { WebSocketClientConfiguration } from "../../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do BlockchainApplication
 */
export class BlockchainConfiguration extends ApplicationConfiguration {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();
}

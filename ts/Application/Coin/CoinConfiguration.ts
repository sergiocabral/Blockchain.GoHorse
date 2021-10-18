import { JsonLoader } from "@sergiocabral/helper";

import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do CoinApplication
 */
export class CoinConfiguration extends JsonLoader {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();
}

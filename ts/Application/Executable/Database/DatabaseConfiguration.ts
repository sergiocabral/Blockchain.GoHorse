import { JsonLoader } from "@sergiocabral/helper";

import { WebSocketClientConfiguration } from "../../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do DatabaseApplication
 */
export class DatabaseConfiguration extends JsonLoader {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();
}

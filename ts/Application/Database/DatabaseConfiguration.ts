import { Configuration } from "@sergiocabral/helper";

import { WebSocketClientConfiguration } from "../../Server/WebSocket/Client/WebSocketClientConfiguration";

/**
 * Configurações do DatabaseApplication
 */
export class DatabaseConfiguration extends Configuration {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBusWebSocketServer = new WebSocketClientConfiguration();
}

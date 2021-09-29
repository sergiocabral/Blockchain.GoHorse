import { Configuration } from "@sergiocabral/helper";

import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends Configuration {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBusWebSocketServer = new WebSocketClientConfiguration();
}

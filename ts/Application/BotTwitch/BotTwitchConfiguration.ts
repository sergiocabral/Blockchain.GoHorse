import { JsonLoader } from "@sergiocabral/helper";

import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends JsonLoader {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBusWebSocketServer = new WebSocketClientConfiguration();
}

import { Configuration } from "@sergiocabral/helper";

import { WebSocketClientConfiguration } from "../../Server/WebSocket/Client/WebSocketClientConfiguration";

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends Configuration {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public webSocketClient = new WebSocketClientConfiguration();
}

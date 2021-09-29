import { Configuration } from "@sergiocabral/helper";

import { WebSocketServerConfiguration } from "../../WebSocket/WebSocketServerConfiguration";

/**
 * Configurações do ButApplication.
 */
export class BusConfiguration extends Configuration {
  /**
   * Configurações do servidor websocket.
   */
  public webSocketServer = new WebSocketServerConfiguration();
}

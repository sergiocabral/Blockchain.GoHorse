import { JsonLoader } from "@sergiocabral/helper";

import { WebSocketServerConfiguration } from "../../WebSocket/WebSocketServerConfiguration";

/**
 * Configurações do ButApplication.
 */
export class BusConfiguration extends JsonLoader {
  /**
   * Configurações do servidor websocket.
   */
  public webSocketServer = new WebSocketServerConfiguration();
}

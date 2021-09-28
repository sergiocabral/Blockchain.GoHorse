import { Configuration } from "@sergiocabral/helper";

import { WebSocketServerConfiguration } from "../../Server/WebSocket/Server/WebSocketServerConfiguration";

/**
 * Configurações do ButApplication.
 */
export class BusConfiguration extends Configuration {
  /**
   * Configurações do servidor websocket.
   */
  public websocket = new WebSocketServerConfiguration();
}

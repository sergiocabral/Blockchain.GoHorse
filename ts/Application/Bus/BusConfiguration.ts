import { Configuration } from "@sergiocabral/helper";

import { WebSocketConfiguration } from "../../Server/WebSocketServer/WebSocketConfiguration";

/**
 * Configurações do ButApplication.
 */
export class BusConfiguration extends Configuration {
  /**
   * Configurações do servidor websocket.
   */
  public websocket = new WebSocketConfiguration();
}

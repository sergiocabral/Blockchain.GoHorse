import { JsonLoader } from "@sergiocabral/helper";

import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do MinerApplication
 */
export class MinerConfiguration extends JsonLoader {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBusWebSocketServer = new WebSocketClientConfiguration();
}

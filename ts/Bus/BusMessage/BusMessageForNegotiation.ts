import { WebSocketClient } from "../../WebSocket/WebSocketClient";

import { BusMessage } from "./BusMessage";

/**
 * Classe base para mensagens do bus usada para negociação entre cliente e servidor.
 */
export abstract class BusMessageForNegotiation extends BusMessage {
  /**
   * Instância do cliente websocket.
   */
  public client?: WebSocketClient;
}

import { Message } from "@sergiocabral/helper";
import { WebSocket } from "ws";

import { WebSocketEvent } from "../WebSocketEvent";
import { WebSocketServer } from "../WebSocketServer";

/**
 * Evento de servidor websocket.
 */
export class WebSocketEventMessage extends Message {
  /**
   * Construtor.
   * @param server Servidor.
   * @param connection Conexão.
   * @param event Evento.
   * @param args Argumentos recebidos.
   */
  public constructor(
    public readonly server: WebSocketServer,
    public readonly connection: WebSocket,
    public readonly event: WebSocketEvent,
    public readonly args: IArguments
  ) {
    super();
  }
}

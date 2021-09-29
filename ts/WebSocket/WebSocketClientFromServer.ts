import { WebSocket } from "ws";

import { BasicProtocol } from "./Protocol/BasicProtocol";
import { IProtocol } from "./Protocol/IProtocol";
import { WebSocketClient } from "./WebSockerClient";
import { WebSocketClientConfiguration } from "./WebSocketClientConfiguration";
import { WebSocketServer } from "./WebSocketServer";

/**
 * Cliente WebSocket oriundo de um WebSocketServer
 */
export class WebSocketClientFromServer extends WebSocketClient {
  /**
   * Construtor.
   * @param server Servidor que originou a conexão.
   * @param configuration Configuração.
   * @param protocol Protocolo de comunicação sobre websocket.
   */
  public constructor(
    public readonly server: WebSocketServer,
    configuration: WebSocketClientConfiguration | WebSocket,
    protocol: new (client: WebSocketClient) => IProtocol = BasicProtocol
  ) {
    super(configuration, protocol);
  }
}

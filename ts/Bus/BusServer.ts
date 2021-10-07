import { WebSocketClient } from "../WebSocket/WebSocketClient";
import { WebSocketServer } from "../WebSocket/WebSocketServer";

import { Bus } from "./Bus";
import { BusMessageJoin } from "./BusMessage/BusMessageJoin";
import { BusMessageText } from "./BusMessage/BusMessageText";
import { IBusMessage } from "./BusMessage/IBusMessage";
import { IBusMessageParse } from "./BusMessage/IBusMessageParse";

/**
 * Servidor do Bus.
 */
export class BusServer extends Bus {
  /**
   * Lista de mensagens do Bus.
   */
  private readonly messages: IBusMessageParse[] = [
    BusMessageJoin,
    BusMessageText,
  ];

  /**
   * Construtor.
   * @param webSocketServer Servidor websocket.
   */
  public constructor(private readonly webSocketServer: WebSocketServer) {
    super();
    webSocketServer.onConnection.add(
      this.handleWebSocketServerConnection.bind(this)
    );
    webSocketServer.clients.forEach((client) =>
      this.handleWebSocketServerConnection(client)
    );
  }

  /**
   * Envia uma mensagem broadcast para todos os clientes.
   * @param message Mensagem
   * @returns Total de clientes que receberam a mensagem
   */
  public send(message: IBusMessage): number {
    const messageEncoded = this.encode(message);

    let clients = 0;
    for (const client of this.webSocketServer.clients) {
      client.send(messageEncoded);
      clients += 1;
    }

    return clients;
  }

  /**
   * Handle: Mensagem recebida.
   */
  private handleWebSocketClientMessage(message: string): void {
    const busMessage = this.decode(message);
    if (busMessage === undefined) {
      return;
    }

    // TODO: Validar a mensagem de Join
    // BusMessageJoin.parse(busMessage);
    // BusMessageText.parse(busMessage);

    // TODO: Repassar a mensagem de acordo com os canais.

    this.webSocketServer.clients.forEach((client) =>
      client.send(this.encode(busMessage))
    );
  }

  /**
   * Handle: uma conexão de cliente foi recebida no servidor.
   */
  private handleWebSocketServerConnection(client: WebSocketClient): void {
    client.onMessage.add(this.handleWebSocketClientMessage.bind(this));
  }
}

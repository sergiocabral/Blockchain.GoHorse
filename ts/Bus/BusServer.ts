import { Message } from "@sergiocabral/helper";

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
    Message.subscribe(BusMessageJoin, this.handleBusMessageJoin.bind(this));
    Message.subscribe(BusMessageText, this.handleBusMessageText.bind(this));
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
   * Mensagem: BusMessageJoin
   */
  private handleBusMessageJoin(message: BusMessageJoin): void {
    // TODO: Receber a inscrição de um cliente em um canal.
  }

  /**
   * Mensagem: BusMessageText
   */
  private handleBusMessageText(message: BusMessageText): void {
    // TODO: Repassar a mensagem de acordo com os canais.

    this.webSocketServer.clients.forEach((client) =>
      client.send(this.encode(message))
    );
  }

  /**
   * Handle: Mensagem recebida.
   */
  private handleWebSocketClientMessage(message: string): void {
    const busMessage = this.decode(message);
    this.messages.forEach((messageType) =>
      messageType.parse(busMessage)?.sendAsync()
    );
  }

  /**
   * Handle: uma conexão de cliente foi recebida no servidor.
   */
  private handleWebSocketServerConnection(client: WebSocketClient): void {
    client.onMessage.add(this.handleWebSocketClientMessage.bind(this));
  }
}

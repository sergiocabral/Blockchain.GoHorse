import { WebSocketClient } from "../WebSocket/WebSocketClient";

import { Bus } from "./Bus";
import { BusJoin } from "./BusMessage/BusJoin";
import { IBusMessage } from "./BusMessage/IBusMessage";

/**
 * Cliente de acesso ao Bus.
 */
export class BusClient extends Bus {
  /**
   * Evento: mensagem recebida.
   */
  public readonly onMessage: Set<
    (message: IBusMessage, client: BusClient) => void
  > = new Set<(message: IBusMessage, client: BusClient) => void>();

  /**
   * Identificador do cliente.
   * @private
   */
  private id: string;

  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   * @param channel Nome do canal.
   */
  public constructor(
    private readonly webSocketClient: WebSocketClient,
    private readonly channel: string
  ) {
    super();

    this.id = Buffer.from(Math.random().toString()).toString("base64");

    webSocketClient.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    webSocketClient.onOpen.add(this.handleWebSocketClientOpen.bind(this));
  }

  /**
   * Enviar uma mensagem.
   * @param message Mensagem
   */
  public send(message: IBusMessage): void {
    const messageEncoded = this.encode(message);
    this.webSocketClient.send(messageEncoded);
  }

  /**
   * Handle: mensagem recebida pelo cliente websocket.
   */
  private handleWebSocketClientMessage(message: string): void {
    const busMessage = this.decode(message);
    if (busMessage === undefined) {
      return;
    }

    this.onMessage.forEach((onMessage) => onMessage(busMessage, this));
  }

  /**
   * Handle: cliente websocket abriu a conexão.
   */
  private handleWebSocketClientOpen() {
    if (this.webSocketClient.started) {
      const busMessage = new BusJoin(this.id, this.channel);
      this.send(busMessage);
    }
  }
}

import { WebSocketClient } from "../WebSocket/WebSocketClient";

import { Bus } from "./Bus";
import { IBusMessage } from "./BusMessage/IBusMessage";
import { ListOfChannels } from "./ListOfChannels";

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
   * Seleção de canais inscritos.
   */
  private subscribeChannels: ListOfChannels = [/.*/];

  /**
   * Construtor.
   * @param webSocketClient Cliente websocket.
   */
  public constructor(private readonly webSocketClient: WebSocketClient) {
    super();

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
   * Se inscreve em um ou mais canais para receber mensagens.
   * @param channels Lista de canais.
   */
  public setChannels(channels: ListOfChannels): void {
    this.subscribeChannels = Array.isArray(channels)
      ? Array<string | RegExp>().concat(channels)
      : channels;

    // TODO: Comunicar ao server os novos canais.
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
    this.setChannels(this.subscribeChannels);
  }
}

import { Message } from "@sergiocabral/helper";

import { WebSocketServer } from "../WebSocketServer";

/**
 * Envia uma mensagem broadcast para todos os clientes em um servidor websocket.
 */
export class WebSocketServerMessageSend extends Message {
  /**
   * Quantidade de clientes que receberam.
   */
  public clients = 0;

  /**
   * Sinaliza que a mensagem foi entregue.
   */
  public delivered = false;

  /**
   * Construtor.
   * @param instance Cliente websocket.
   * @param message Mensagem.
   */
  public constructor(
    public readonly instance: WebSocketServer,
    public readonly message: string
  ) {
    super();
  }
}

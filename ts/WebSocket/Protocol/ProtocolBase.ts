import { Message } from "@sergiocabral/helper";

import { WebSocketClientMessageSend } from "../Message/WebSocketClientMessageSend";
import { WebSocketClient } from "../WebSockerClient";

import { IProtocol } from "./IProtocol";

/**
 * Classe base para implementação de um protocolo de comunicação sobre websocket.
 */
export abstract class ProtocolBase implements IProtocol {
  /**
   * Construtor.
   * @param client Cliente websocket.
   */
  public constructor(protected readonly client: WebSocketClient) {
    Message.subscribe(
      WebSocketClientMessageSend,
      this.handleWebSocketClientMessageSend.bind(this)
    );
  }

  /**
   * Identificador do protocolo.
   */
  public abstract get identifier(): string;

  /**
   * Recebe uma mensagem.
   */
  public abstract receive(message: string): void;

  /**
   * Transmite uma mensagem.
   */
  protected abstract transmit(message: string): void;

  /**
   * Subscribe: WebSocketClientMessageSend
   */
  private handleWebSocketClientMessageSend(
    message: WebSocketClientMessageSend
  ): void {
    if (!Object.is(this.client, message.instance) || !this.client.started) {
      return;
    }

    this.transmit(message.message);

    message.delivered = true;
  }
}

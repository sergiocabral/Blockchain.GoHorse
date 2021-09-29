import { Logger, LogLevel, Message } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../Message/WebSocketClientMessageReceived";
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
  public constructor(private readonly client: WebSocketClient) {
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
   * Sinaliza uma mensagem recebida.
   */
  public messageReceived(message: string): void {
    Logger.post(
      "Websocket client received message: {0}",
      message,
      LogLevel.Verbose,
      this.client.constructor.name
    );

    void new WebSocketClientMessageReceived(this.client, message).sendAsync();
  }

  /**
   * subscribe: WebSocketClientMessageSend
   */
  private handleWebSocketClientMessageSend(
    message: WebSocketClientMessageSend
  ): void {
    if (!Object.is(this.client, message.instance) || !this.client.started) {
      return;
    }

    this.client.sendRawMessage(message.message);

    message.delivered = true;

    Logger.post(
      "Websocket client sent a message: {0}",
      message.message,
      LogLevel.Verbose,
      this.client.constructor.name
    );
  }
}

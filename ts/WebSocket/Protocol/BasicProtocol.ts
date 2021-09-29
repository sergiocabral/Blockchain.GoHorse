import { Logger, LogLevel } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../Message/WebSocketClientMessageReceived";

import { ProtocolBase } from "./ProtocolBase";

/**
 * Protocolo básico.
 */
export class BasicProtocol extends ProtocolBase {
  /**
   * Lista de mensagens para transmitir.
   */
  private readonly messages: string[] = [];

  /**
   * Recebe uma mensagem.
   */
  public receive(message: string): void {
    Logger.post(
      "Websocket client received message: {0}",
      message,
      LogLevel.Verbose,
      this.client.constructor.name
    );

    void new WebSocketClientMessageReceived(this.client, message).sendAsync();
  }

  /**
   * Transmite uma mensagem.
   */
  protected override transmit(message: string): void {
    this.messages.push(message);
    this.pooling();
  }

  /**
   * Obtém a última mensagem
   */
  private pooling(): void {
    const message = this.messages.shift();

    if (message !== undefined) {
      this.client.sendRawMessage(message);

      Logger.post(
        "Websocket client sent a message: {0}",
        message,
        LogLevel.Verbose,
        this.client.constructor.name
      );

      setImmediate(() => this.pooling());
    }
  }
}

import { Logger, LogLevel } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../Message/WebSocketClientMessageReceived";

import { ProtocolBase } from "./ProtocolBase";

/**
 * Protocolo básico.
 */
export class BasicProtocol extends ProtocolBase {
  /**
   * Identificador do protocolo.
   */
  public readonly identifier = "BASIC";

  /**
   * Recebe uma mensagem.
   */
  public override receive(message: string): void {
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
    this.client.sendRawMessage(message);

    Logger.post(
      "Websocket client sent a message: {0}",
      message,
      LogLevel.Verbose,
      this.client.constructor.name
    );
  }
}

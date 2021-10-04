import { Logger, LogLevel } from "@sergiocabral/helper";

import { ProtocolBase } from "./ProtocolBase";

/**
 * Protocolo sem nenhuma ação.
 */
export class NoProtocol extends ProtocolBase {
  /**
   * Recebe um pacote externo.
   */
  public override receive(packet: string): void {
    Logger.post(
      "Websocket client received message: {0}",
      packet,
      LogLevel.Verbose,
      this.client.constructor.name
    );

    this.onMessageReceived.forEach((onMessageReceived) =>
      onMessageReceived(packet)
    );
  }

  /**
   * Transmite uma mensagem interna.
   */
  public override transmit(message: string): void {
    this.client.send(message, "raw");

    Logger.post(
      "Websocket client sent a message: {0}",
      message,
      LogLevel.Verbose,
      this.client.constructor.name
    );
  }
}

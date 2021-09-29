import { InvalidDataError, Logger, LogLevel } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../Message/WebSocketClientMessageReceived";

import { ProtocolBase } from "./ProtocolBase";

/**
 * Protocolo básico.
 */
export class BasicProtocol extends ProtocolBase {
  /**
   * Identificador  do protocolo.
   */
  private readonly identifier = "BASIC";

  /**
   * Lista de mensagens para transmitir.
   */
  private readonly messages: string[] = [];

  /**
   * Recebe uma mensagem.
   */
  public receive(messageRaw: string): void {
    try {
      const message = this.extractMessage(messageRaw);

      Logger.post(
        "Websocket client received message: {0}",
        message,
        LogLevel.Verbose,
        this.client.constructor.name
      );

      void new WebSocketClientMessageReceived(this.client, message).sendAsync();
    } catch (error) {
      this.client.stop();

      Logger.post(
        "Websocket client stopped the connection because an error: {0}",
        error instanceof Error ? error.message : String(error),
        LogLevel.Warning,
        this.client.constructor.name
      );
    }
  }

  /**
   * Transmite uma mensagem.
   */
  protected override transmit(message: string): void {
    this.messages.push(message);
    this.pooling();
  }

  /**
   * Codifica uma mensagem para envio.
   * @param message Mensagem.
   */
  private encodeMessage(message: string): string {
    return `${this.identifier}\n${Buffer.from(message).toString("base64")}`;
  }

  /**
   * Valida se o protocolo é compatível.
   * @param messageRaw Mensagem.
   */
  private extractMessage(messageRaw: string): string {
    const lines = messageRaw.split("\n");

    const firstLine = lines[0];
    if (firstLine !== this.identifier) {
      throw new InvalidDataError("Protocol not supported");
    }

    const message = lines[1];
    if (message === undefined) {
      throw new InvalidDataError("Blank message body");
    }

    try {
      return Buffer.from(message, "base64").toString();
    } catch (error) {
      throw new InvalidDataError("Wrongly encoded message.");
    }
  }

  /**
   * Obtém a última mensagem
   */
  private pooling(): void {
    const message = this.messages.shift();

    if (message !== undefined) {
      const messageRaw = this.encodeMessage(message);
      this.client.sendRawMessage(messageRaw);

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

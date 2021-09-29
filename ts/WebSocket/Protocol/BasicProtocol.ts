import { Logger, LogLevel } from "@sergiocabral/helper";

import { WebSocketClientMessageReceived } from "../Message/WebSocketClientMessageReceived";

import { ProtocolBase } from "./ProtocolBase";
import { ProtocolError } from "./ProtocolError";

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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode = error instanceof ProtocolError ? error.code : -1;

      this.client.stop(errorCode, errorMessage);

      Logger.post(
        "Websocket client stopped the connection because an error: {errorCode}, {errorMessage}",
        { errorCode, errorMessage },
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
      throw ProtocolError.create(ProtocolError.VERSION_NOT_SUPPORTED);
    }

    const message = lines[1];
    if (!message) {
      throw ProtocolError.create(ProtocolError.BLANK_MESSAGE_BODY);
    }

    try {
      return Buffer.from(message, "base64").toString();
    } catch (error) {
      throw ProtocolError.create(ProtocolError.WRONGLY_ENCODED_MESSAGE, error);
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

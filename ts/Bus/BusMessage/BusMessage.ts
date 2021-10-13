import { Message } from "@sergiocabral/helper";
import md5 from "md5";

import { FieldValidator } from "../FieldValidator";

import { IBusMessage } from "./IBusMessage";

/**
 * Estrutura comum das mensagens do Bus.
 */
export abstract class BusMessage extends Message implements IBusMessage {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusMessage | undefined {
    return FieldValidator.id(instance) &&
      FieldValidator.clientId(instance) &&
      FieldValidator.channels(instance)
      ? (instance as BusMessage)
      : undefined;
  }

  /**
   * Identificador do client.
   */
  public clientId?: string;

  /**
   * Identificador único.
   */
  public id: string;

  /**
   * Timestamp.
   */
  public timestamp: number;

  /**
   * Tipo da mensagem.
   */
  public type: string;

  /**
   * Construtor.
   * @param channels Canais destinatários.
   */
  protected constructor(public readonly channels: string[]) {
    super();
    this.type = this.constructor.name;
    this.timestamp = new Date().getTime();
    this.id = this.hash(
      `${this.type}${this.clientId}${this.channels.toString()}${this.timestamp}`
    );
  }

  /**
   * Gerador de hash.
   */
  protected hash(input: unknown): string {
    return md5(String(input));
  }
}

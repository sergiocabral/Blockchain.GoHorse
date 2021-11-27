import { HelperObject, Message } from "@sergiocabral/helper";
import sha1 from "sha1";

import { FieldValidator } from "../FieldValidator";

/**
 * Estrutura comum das mensagens do Bus.
 */
export abstract class BusMessage extends Message {
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
   * Sinaliza que foi entregue para alguém.
   */
  public delivered = false;

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
  public constructor(public readonly channels: string[]) {
    super();
    this.type = this.constructor.name;
    this.timestamp = new Date().getTime();
    this.id = this.hash(
      `${this.type}${this.clientId}${this.channels.toString()}${this.timestamp}`
    );
  }

  /**
   * Adiciona uma informação ao id da mensagem.
   */
  public addIdentifier(identifier: unknown): this {
    this.id = this.hash(`${this.id}${HelperObject.toText(identifier, 0)}`);

    return this;
  }

  /**
   * Gerador de hash.
   */
  protected hash(input: unknown): string {
    return sha1(String(input));
  }
}

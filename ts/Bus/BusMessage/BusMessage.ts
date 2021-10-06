import md5 from "md5";

import { FieldValidator } from "../FieldValidator";
import { ListOfChannels } from "../ListOfChannels";

import { IBusMessage } from "./IBusMessage";

/**
 * Estrutura comum das mensagens do Bus.
 */
export abstract class BusMessage implements IBusMessage {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusMessage | undefined {
    return FieldValidator.id(instance) && FieldValidator.channels(instance)
      ? (instance as BusMessage)
      : undefined;
  }

  /**
   * Identificador único.
   */
  public id: string;

  /**
   * Tipo da mensagem.
   */
  public type: string;

  /**
   * Construtor.
   * @param channels Canais destinatários.
   */
  protected constructor(public readonly channels: ListOfChannels) {
    this.id = this.hash(Math.random().toString());
    this.type = this.constructor.name;
  }

  /**
   * Gerador de hash.
   */
  protected hash(input: unknown): string {
    return md5(String(input));
  }
}

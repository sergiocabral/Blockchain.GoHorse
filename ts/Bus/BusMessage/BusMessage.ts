import md5 from "md5";

import { ListOfChannels } from "../ListOfChannels";

import { IBusMessage } from "./IBusMessage";

/**
 * Estrutura comum das mensagens do Bus.
 */
export abstract class BusMessage implements IBusMessage {
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
  public constructor(public readonly channels: ListOfChannels) {
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

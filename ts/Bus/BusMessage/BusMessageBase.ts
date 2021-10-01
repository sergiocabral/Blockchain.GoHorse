import md5 from "md5";

import { ListOfChannels } from "../ListOfChannels";

import { IBusMessage } from "./IBusMessage";

/**
 * Estrutura comum das mensagens do Bus.
 */
export abstract class BusMessageBase implements IBusMessage {
  /**
   * Construtor.
   * @param channels Canais destinatários.
   */
  public constructor(public readonly channels: ListOfChannels) {}

  /**
   * Identificador único.
   */
  public get id(): string {
    return this.hash(Math.random().toString());
  }

  /**
   * Tipo da mensagem.
   */
  public get type(): string {
    return this.constructor.name;
  }

  /**
   * Gerador de hash.
   */
  protected hash(input: unknown): string {
    return md5(String(input));
  }
}

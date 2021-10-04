import { Bus } from "../Bus";
import { ListOfChannels } from "../ListOfChannels";

import { BusMessageBase } from "./BusMessageBase";

/**
 * Envia uma string para o bus
 */
export class BusMessageText extends BusMessageBase {
  /**
   * Construtor.
   * @param channels Canais destinatários
   * @param text Texto para enviar.
   */
  public constructor(
    public readonly text: string,
    channels: ListOfChannels = Bus.ALL_CHANNELS
  ) {
    super(channels);
  }

  /**
   * Identificador único.
   */
  public get id(): string {
    return this.hash(`${this.type}+${this.text}`);
  }
}

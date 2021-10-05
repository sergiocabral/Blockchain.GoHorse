import { Bus } from "../Bus";
import { ListOfChannels } from "../ListOfChannels";

import { BusMessage } from "./BusMessage";

/**
 * Envia uma string para o bus
 */
export class BusMessageText extends BusMessage {
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
    this.id = this.hash(`${this.type}+${this.text}`);
  }
}

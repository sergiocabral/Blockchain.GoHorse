import { AllChannels } from "../AllChannels";

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
    channels: AllChannels | string[],
    public readonly text: string
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

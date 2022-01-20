import { Bus } from '../../Core/Bus';
import { FieldValidator } from '../../Core/FieldValidator';
import { BusMessage } from '../BusMessage';
import { BusMessageForCommunication } from '../BusMessageForCommunication';

/**
 * Envia uma string para o bus
 */
export class BusMessageText extends BusMessageForCommunication {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusMessageText | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, BusMessageText)
        ? (instance as BusMessageText)
        : undefined;

    return busMessage !== undefined
      ? Object.assign(new BusMessageText('', []), busMessage)
      : undefined;
  }

  /**
   * Construtor.
   * @param channels Canais destinatários
   * @param text Texto para enviar.
   */
  public constructor(
    public readonly text: string,
    channels: string[] = [Bus.ALL_CHANNELS]
  ) {
    super(channels);
    this.id = this.hash(`${this.id}${this.text}`);
  }
}

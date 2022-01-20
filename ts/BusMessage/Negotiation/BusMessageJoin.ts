import { FieldValidator } from '../../Core/FieldValidator';
import { BusMessage } from '../BusMessage';
import { BusMessageForNegotiation } from '../BusMessageForNegotiation';

/**
 * Faz o ingresso no Core.
 */
export class BusMessageJoin extends BusMessageForNegotiation {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusMessageJoin | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, BusMessageJoin)
        ? (instance as BusMessageJoin)
        : undefined;

    return busMessage?.channels.length === 1
      ? Object.assign(new BusMessageJoin('', ''), busMessage)
      : undefined;
  }

  /**
   * Construtor.
   * @param clientId Identificador do cliente.
   * @param channel Nome do canal.
   */
  public constructor(
    public override readonly clientId: string,
    channel: string
  ) {
    super([channel]);
    this.id = this.hash(`${this.id}${this.clientId}`);
  }
}

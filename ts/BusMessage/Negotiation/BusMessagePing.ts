import { FieldValidator } from '../../Core/FieldValidator';
import { BusMessage } from '../BusMessage';
import { BusMessageForNegotiation } from '../BusMessageForNegotiation';

/**
 * Sinaliza conexão ativa por parte do cliente.
 */
export class BusMessagePing extends BusMessageForNegotiation {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusMessagePing | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, BusMessagePing)
        ? (instance as BusMessagePing)
        : undefined;

    return busMessage?.channels.length === 0
      ? Object.assign(new BusMessagePing(''), busMessage)
      : undefined;
  }

  /**
   * Construtor.
   * @param clientId Identificador do cliente.
   */
  public constructor(public override readonly clientId: string) {
    super([]);
    this.id = this.hash(`${this.id}${this.clientId}`);
  }
}

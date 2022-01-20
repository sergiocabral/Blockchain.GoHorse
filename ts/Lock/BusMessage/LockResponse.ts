import { BusMessage } from '../../BusMessage/BusMessage';
import { BusMessageForNegotiation } from '../../BusMessage/BusMessageForNegotiation';
import { FieldValidator } from '../../Core/FieldValidator';
import { Lock } from '../Message/Lock';

/**
 * Resposta do bloqueio.
 */
export class LockResponse extends BusMessageForNegotiation {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): LockResponse | undefined {
    const busMessage =
      BusMessage.parse(instance) && FieldValidator.type(instance, LockResponse)
        ? (instance as Record<string, unknown>)
        : undefined;

    if (typeof busMessage?.lock !== 'object' || busMessage?.lock === null) {
      return undefined;
    }

    busMessage.lock = Object.assign(new Lock(0), busMessage?.lock);

    return Object.assign(new LockResponse({} as unknown as Lock), busMessage);
  }

  /**
   * Construtor.
   * @param lock Bloqueio.
   */
  public constructor(public readonly lock: Lock) {
    super([]);
  }
}

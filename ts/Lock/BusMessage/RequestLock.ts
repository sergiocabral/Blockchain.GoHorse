import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { BusMessageForNegotiation } from "../../Bus/BusMessage/BusMessageForNegotiation";
import { FieldValidator } from "../../Bus/FieldValidator";
import { Lock } from "../Message/Lock";

/**
 * Solicita um bloqueio para sincronização de clientes do Bus
 */
export class RequestLock extends BusMessageForNegotiation {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): RequestLock | undefined {
    const busMessage =
      BusMessage.parse(instance) && FieldValidator.type(instance, RequestLock)
        ? (instance as Record<string, unknown>)
        : undefined;

    if (typeof busMessage?.lock !== "object" || busMessage?.lock === null) {
      return undefined;
    }

    busMessage.lock = Object.assign(new Lock(0), busMessage?.lock);

    return Object.assign(new RequestLock({} as unknown as Lock), busMessage);
  }

  /**
   * Construtor.
   * @param lock Bloqueio.
   */
  public constructor(public readonly lock: Lock) {
    super([]);
  }
}

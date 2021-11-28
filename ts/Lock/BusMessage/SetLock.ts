import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { BusMessageForNegotiation } from "../../Bus/BusMessage/BusMessageForNegotiation";
import { FieldValidator } from "../../Bus/FieldValidator";
import { LockAction } from "../LockAction";
import { Lock } from "../Message/Lock";

/**
 * Solicita um bloqueio para sincronização de clientes do Bus
 */
export class SetLock extends BusMessageForNegotiation {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): SetLock | undefined {
    const busMessage =
      BusMessage.parse(instance) && FieldValidator.type(instance, SetLock)
        ? (instance as Record<string, unknown>)
        : undefined;

    if (typeof busMessage?.lock !== "object" || busMessage?.lock === null) {
      return undefined;
    }

    busMessage.lock = Object.assign(new Lock(0), busMessage?.lock);

    return Object.assign(
      new SetLock({} as unknown as Lock, "" as unknown as LockAction),
      busMessage
    );
  }

  /**
   * Construtor.
   * @param lock Bloqueio.
   * @param action Ação.
   */
  public constructor(
    public readonly lock: Lock,
    public readonly action: LockAction
  ) {
    super([]);
  }
}

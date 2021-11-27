import { BusMessageForNegotiation } from "../../Bus/BusMessage/BusMessageForNegotiation";
import { Lock } from "../Message/Lock";

/**
 * Solicita um bloqueio para sincronização de clientes do Bus
 */
export class RequestLock extends BusMessageForNegotiation {
  /**
   * Construtor.
   * @param lock Bloqueio.
   */
  public constructor(public readonly lock: Lock) {
    super([]);
  }
}

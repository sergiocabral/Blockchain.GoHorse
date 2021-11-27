import { BusMessageForNegotiation } from "../../Bus/BusMessage/BusMessageForNegotiation";
import { Lock } from "../Message/Lock";

/**
 * Resposta do bloqueio.
 */
export class LockResponse extends BusMessageForNegotiation {
  /**
   * Construtor.
   * @param lock Bloqueio.
   */
  public constructor(public readonly lock: Lock) {
    super([]);
  }
}

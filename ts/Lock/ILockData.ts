import { LockResult } from "./LockResult";
import { Lock } from "./Message/Lock";

/**
 * Informações de um lock.
 */
export interface ILockData {
  /**
   * Identificador.
   */
  id: string;

  /**
   * Lock.
   */
  lock: Lock;

  /**
   * Responde se o lock foi feito ou não.
   */
  resolve?(result?: LockResult): void;
}

import { LockResult } from './LockResult';
import { Lock } from './Message/Lock';

/**
 * Informações de um lock.
 */
export interface ILockData {
  /**
   * Resultados esperados.
   */
  expectedResult: LockResult[];

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
  resolve?(result?: LockResult): Promise<void>;
}

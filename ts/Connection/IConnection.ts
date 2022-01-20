import { ConnectionState } from './ConnectionState';

/**
 * Interface de classes que estabelecem conexão.
 */
export interface IConnection {
  /**
   * Estado da conexão.
   */
  get state(): ConnectionState;

  /**
   * Fecha a conexão.
   */
  close(): Promise<void>;

  /**
   * Abre a conexão.
   */
  open(): Promise<void>;
}

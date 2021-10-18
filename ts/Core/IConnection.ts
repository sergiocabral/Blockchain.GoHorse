/**
 * Interface de classes que estabelecem conexão.
 */
export interface IConnection {
  /**
   * Sinaliza que a conexão está aberta.
   */
  get opened(): boolean;

  /**
   * Fecha a conexão.
   */
  close(): Promise<void>;

  /**
   * Abre a conexão.
   */
  open(): Promise<void>;
}

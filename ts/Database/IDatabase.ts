/**
 * Interface para um banco de dados usado pelo sistema.
 */
export interface IDatabase {
  /**
   * Sinaliza se a conexão foi iniciada.
   */
  get opened(): boolean;

  /**
   * Fechar conexão.
   */
  close(): Promise<void>;

  /**
   * Abrir conexão.
   */
  open(): Promise<void>;
}

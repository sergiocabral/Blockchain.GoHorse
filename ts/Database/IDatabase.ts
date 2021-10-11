/**
 * Interface para um banco de dados usado pelo sistema.
 */
export interface IDatabase {
  /**
   * Fechar conexão.
   */
  close(): Promise<void>;

  /**
   * Abrir conexão.
   */
  open(): Promise<void>;
}

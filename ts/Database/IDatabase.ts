/**
 * Interface para um banco de dados usado pelo sistema.
 */
export interface IDatabase {
  /**
   * Sinaliza se a conexão foi iniciada.
   */
  get opened(): boolean;

  /**
   * Grava uma entrada em uma tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   * @param value Valor.
   */
  addEntry(tableName: string, id: string, value: unknown): Promise<void>;

  /**
   * Fechar conexão.
   */
  close(): Promise<void>;

  /**
   * Abrir conexão.
   */
  open(): Promise<void>;

  /**
   * Apaga uma entrada de uma tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   */
  removeEntry(tableName: string, id: string): Promise<void>;
}

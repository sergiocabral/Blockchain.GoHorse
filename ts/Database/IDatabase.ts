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
   * Apaga uma entrada na tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   */
  del(tableName: string, id: string): Promise<void>;

  /**
   * Abrir conexão.
   */
  open(): Promise<void>;

  /**
   * Grava uma entrada na tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   * @param value Valor.
   */
  set(
    tableName: string,
    id: string,
    value: unknown
  ): Promise<void>;

  /**
   * Retorna um identificador baseado no momento atual.
   */
  timeId(): Promise<string>;
}

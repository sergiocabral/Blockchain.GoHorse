/**
 * Representa uma conexão com o banco de dados tipo SQL.
 */
export interface IDatabaseSql {
  /**
   * Grava um conjunto de valores em uma tabela.
   * @param values Campos e valores.
   * @param table Nome da tabela.
   */
  save(values: Record<string, unknown>, table: string): Promise<void> | void;
}

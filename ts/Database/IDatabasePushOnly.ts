/**
 * Representa uma conexão com o banco de dados que recebe dados em única via.
 */
export interface IDatabasePushOnly {
  /**
   * Grava um conjuntos de valores.
   * @param values Valores.
   */
  push(values: Record<string, unknown>): Promise<this> | this;
}

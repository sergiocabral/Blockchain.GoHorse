import { Database } from '../Database';
import { IDatabaseSql } from '../IDatabaseSql';

/**
 * Conexão com o banco de dados SqlServer.
 */
export class SqlServerDatabase extends Database implements IDatabaseSql {
  /**
   * Grava um conjunto de valores em uma tabela.
   * @param values Campos e valores.
   * @param table Nome da tabela.
   */
  public save(values: Record<string, unknown>, table: string): void {
    void values;
    void table;
    // TODO: Implementar SqlServerDatabase.save - https://docs.microsoft.com/pt-br/sql/connect/node-js/step-3-proof-of-concept-connecting-to-sql-using-node-js?view=sql-server-ver16
  }
}

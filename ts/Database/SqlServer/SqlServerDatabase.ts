import { Database } from '../Database';
import { IDatabaseSql } from '../IDatabaseSql';
import { SqlServerDatabaseConfiguration } from './SqlServerDatabaseConfiguration';

/**
 * Conexão com o banco de dados SqlServer.
 */
export class SqlServerDatabase
  extends Database<SqlServerDatabaseConfiguration>
  implements IDatabaseSql
{
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

  /**
   * Força a finalização de qualquer conexão aberta e redefine a instância da conexão.
   */
  protected override resetConnection(
    configuration: SqlServerDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar SqlServerDatabase.resetConnection
  }

  /**
   * Fecha a conexão
   */
  protected override closeConnection(
    configuration: SqlServerDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar SqlServerDatabase.closeConnection
  }

  /**
   * Abre a conexão
   */
  protected override openConnection(
    configuration: SqlServerDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar SqlServerDatabase.openConnection
  }
}

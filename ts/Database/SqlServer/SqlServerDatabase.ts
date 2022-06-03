import { Database } from '../Database';
import { SqlServerDatabaseConfiguration } from './SqlServerDatabaseConfiguration';
import { IDatabasePushOnly } from '../IDatabasePushOnly';

/**
 * Conexão com o banco de dados SqlServer.
 */
export class SqlServerDatabase
  extends Database<SqlServerDatabaseConfiguration>
  implements IDatabasePushOnly
{
  /**
   * Grava um conjuntos de valores.
   * @param values Valores.
   */
  push(values: Record<string, unknown>): Promise<this> | this {
    // TODO: Implementar SqlServerDatabase.push - https://docs.microsoft.com/pt-br/sql/connect/node-js/step-3-proof-of-concept-connecting-to-sql-using-node-js?view=sql-server-ver16
    void values;
    return this;
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

import { Database } from '../Database';
import { MySqlDatabaseConfiguration } from './MySqlDatabaseConfiguration';
import { IDatabasePushOnly } from '../IDatabasePushOnly';

/**
 * Conexão com o banco de dados MySql.
 */
export class MySqlDatabase
  extends Database<MySqlDatabaseConfiguration>
  implements IDatabasePushOnly
{
  /**
   * Grava um conjuntos de valores.
   * @param values Valores.
   */
  push(values: Record<string, unknown>): Promise<this> | this {
    // TODO: Implementar MySqlDatabase.push - https://www.npmjs.com/package/mysql
    void values;
    return this;
  }

  /**
   * Força a finalização de qualquer conexão aberta e redefine a instância da conexão.
   */
  protected override resetConnection(
    configuration: MySqlDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar MySqlDatabase.resetConnection
  }

  /**
   * Fecha a conexão
   */
  protected override closeConnection(
    configuration: MySqlDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar MySqlDatabase.closeConnection
  }

  /**
   * Abre a conexão
   */
  protected override openConnection(
    configuration: MySqlDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar MySqlDatabase.openConnection
  }
}

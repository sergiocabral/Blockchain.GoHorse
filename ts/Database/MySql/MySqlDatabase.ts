import { Database } from '../Database';
import { IDatabaseSql } from '../IDatabaseSql';
import { MySqlDatabaseConfiguration } from './MySqlDatabaseConfiguration';

/**
 * Conexão com o banco de dados MySql.
 */
export class MySqlDatabase
  extends Database<MySqlDatabaseConfiguration>
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
    // TODO: Implementar MySqlDatabase.save - https://www.npmjs.com/package/mysql
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

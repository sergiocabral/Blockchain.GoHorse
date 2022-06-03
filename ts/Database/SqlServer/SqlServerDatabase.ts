import { Database } from '../Database';
import { SqlServerDatabaseConfiguration } from './SqlServerDatabaseConfiguration';
import { IDatabasePushOnly } from '../IDatabasePushOnly';
import { PrimitiveValueType } from '@sergiocabral/helper';

/**
 * Conexão com o banco de dados SqlServer.
 */
export class SqlServerDatabase
  extends Database<SqlServerDatabaseConfiguration>
  implements IDatabasePushOnly
{
  /**
   * Grava um conjuntos de valores.
   * @param values Campos e valores.
   * @param extra Valores extra em formato para JSON
   */
  public push(
    values: Record<string, PrimitiveValueType | undefined>,
    extra: Record<string, PrimitiveValueType | undefined> | PrimitiveValueType[]
  ): Promise<this> | this {
    // TODO: Implementar SqlServerDatabase.push - https://docs.microsoft.com/pt-br/sql/connect/node-js/step-3-proof-of-concept-connecting-to-sql-using-node-js?view=sql-server-ver16
    void values;
    void extra;
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

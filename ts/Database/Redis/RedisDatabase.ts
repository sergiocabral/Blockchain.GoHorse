import { Database } from '../Database';
import { IDatabasePushOnly } from '../IDatabasePushOnly';
import { RedisDatabaseConfiguration } from './RedisDatabaseConfiguration';
import { PrimitiveValueType } from '@sergiocabral/helper';

/**
 * Conexão com o banco de dados Redis.
 */
export class RedisDatabase
  extends Database<RedisDatabaseConfiguration>
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
    // TODO: Implementar RedisDatabase.push - https://www.npmjs.com/package/redis
    void values;
    void extra;
    return this;
  }

  /**
   * Força a finalização de qualquer conexão aberta e redefine a instância da conexão.
   */
  protected override resetConnection(
    configuration: RedisDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar RedisDatabase.resetConnection
  }

  /**
   * Fecha a conexão
   */
  protected override closeConnection(
    configuration: RedisDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar RedisDatabase.closeConnection
  }

  /**
   * Abre a conexão
   */
  protected override openConnection(
    configuration: RedisDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar RedisDatabase.openConnection
  }
}

import { Database } from '../Database';
import { IDatabaseJson } from '../IDatabaseJson';
import { RedisDatabaseConfiguration } from './RedisDatabaseConfiguration';

/**
 * Conexão com o banco de dados Redis.
 */
export class RedisDatabase
  extends Database<RedisDatabaseConfiguration>
  implements IDatabaseJson
{
  /**
   * Grava um documento.
   * @param document Documento JSON.
   */
  public save(document: Record<string, unknown>): void {
    void document;
    // TODO: Implementar RedisDatabase.save - https://www.npmjs.com/package/redis
  }

  /**
   * Força a finalização de qualquer conexão aberta e redefine a instância da conexão.
   */
  public override resetConnection(
    configuration: RedisDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar RedisDatabase.resetConnection
  }

  /**
   * Fecha a conexão
   */
  public override closeConnection(
    configuration: RedisDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar RedisDatabase.closeConnection
  }

  /**
   * Abre a conexão
   */
  public override openConnection(
    configuration: RedisDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar RedisDatabase.openConnection
  }
}

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
   * Configura a conexão
   */
  public override configureConnection(
    configuration: RedisDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar RedisDatabase.configureConnection
  }
}

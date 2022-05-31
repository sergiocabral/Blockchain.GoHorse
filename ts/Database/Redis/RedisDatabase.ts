import { Database } from '../Database';
import { IDatabaseJson } from '../IDatabaseJson';

/**
 * Conexão com o banco de dados Redis.
 */
export class RedisDatabase extends Database implements IDatabaseJson {
  /**
   * Grava um documento.
   * @param document Documento JSON.
   */
  public save(document: Record<string, unknown>): void {
    void document;
    // TODO: Implementar RedisDatabase.save
  }
}

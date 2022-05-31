import { Database } from '../Database';
import { IDatabaseJson } from '../IDatabaseJson';

/**
 * Conexão com o banco de dados DatabaseJson.
 */
export class ElasticSearchDatabase extends Database implements IDatabaseJson {
  /**
   * Grava um documento.
   * @param document Documento JSON.
   */
  public save(document: Record<string, unknown>): void {
    void document;
    // TODO: Implementar ElasticSearchDatabase.save
  }
}

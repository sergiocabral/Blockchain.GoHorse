import { Database } from '../Database';
import { IDatabaseJson } from '../IDatabaseJson';
import { ElasticSearchDatabaseConfiguration } from './ElasticSearchDatabaseConfiguration';

/**
 * Conexão com o banco de dados DatabaseJson.
 */
export class ElasticSearchDatabase
  extends Database<ElasticSearchDatabaseConfiguration>
  implements IDatabaseJson
{
  /**
   * Grava um documento.
   * @param document Documento JSON.
   */
  public save(document: Record<string, unknown>): void {
    void document;
    // TODO: Implementar ElasticSearchDatabase.save - https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/installation.html
  }

  /**
   * Configura a conexão
   */
  public override configureConnection(
    configuration: ElasticSearchDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar ElasticSearchDatabase.configureConnection
  }
}

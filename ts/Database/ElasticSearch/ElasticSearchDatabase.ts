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
   * Força a finalização de qualquer conexão aberta e redefine a instância da conexão.
   */
  public override resetConnection(
    configuration: ElasticSearchDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar ElasticSearchDatabase.resetConnection
  }

  /**
   * Fecha a conexão
   */
  public override closeConnection(
    configuration: ElasticSearchDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar ElasticSearchDatabase.closeConnection
  }

  /**
   * Abre a conexão
   */
  public override openConnection(
    configuration: ElasticSearchDatabaseConfiguration
  ): void {
    void configuration;
    // TODO: Implementar ElasticSearchDatabase.openConnection
  }
}

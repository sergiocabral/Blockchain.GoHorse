import { Database } from '../Database';
import { IDatabaseJson } from '../IDatabaseJson';
import { ElasticSearchDatabaseConfiguration } from './ElasticSearchDatabaseConfiguration';
import { Client } from '@elastic/elasticsearch';
import { ClientOptions } from '@elastic/elasticsearch/lib/client';
import { Definition } from './Definition';
import { HttpStatusCode } from '@sergiocabral/helper';
import { Get } from '@gohorse/npm-core';
import { ResponseError } from '@elastic/transport/lib/errors';

/**
 * Conexão com o banco de dados DatabaseJson.
 */
export class ElasticSearchDatabase
  extends Database<ElasticSearchDatabaseConfiguration>
  implements IDatabaseJson
{
  /**
   * Cliente do banco de dados.
   */
  private client?: Client;

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
  protected override async resetConnection(): Promise<void> {
    await this.closeConnection();
  }

  /**
   * Fecha a conexão
   */
  protected override async closeConnection(): Promise<void> {
    if (this.client !== undefined) {
      await this.client.close();
      this.client = undefined;
    }
  }

  /**
   * Abre a conexão
   */
  protected override async openConnection(
    configuration: ElasticSearchDatabaseConfiguration
  ): Promise<void> {
    const options: ClientOptions = {
      node: `${Definition.DEFAULT_ELASTICSEARCH_PROTOCOL}://${Definition.DEFAULT_ELASTICSEARCH_SERVER}:${Definition.DEFAULT_ELASTICSEARCH_PORT}`
    };
    if (typeof configuration.username === 'string') {
      options.auth = {
        username: configuration.username,
        password: Get.password(configuration.password ?? '')
      };
    }
    this.client = new Client(options);
    try {
      await this.client.ping();
    } catch (error: unknown) {
      const connected =
        error instanceof ResponseError &&
        error.statusCode === HttpStatusCode.Forbidden;
      if (!connected) {
        throw error;
      }
    }
  }
}

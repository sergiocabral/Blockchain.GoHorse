import { Database } from '../Database';
import { IDatabasePushOnly } from '../IDatabasePushOnly';
import { ElasticSearchDatabaseConfiguration } from './ElasticSearchDatabaseConfiguration';
import { Client } from '@elastic/elasticsearch';
import { ClientOptions } from '@elastic/elasticsearch/lib/client';
import {
  EmptyError,
  HelperObject,
  HttpStatusCode,
  PrimitiveValueType
} from '@sergiocabral/helper';
import { Get } from '@gohorse/npm-core';
import { ResponseError } from '@elastic/transport/lib/errors';
import { ApplicationParameters } from '../../Application/ApplicationParameters';
import { Definition } from './Definition';

/**
 * Conexão com o banco de dados ElasticSearch.
 */
export class ElasticSearchDatabase
  extends Database<ElasticSearchDatabaseConfiguration>
  implements IDatabasePushOnly
{
  /**
   * Cliente do banco de dados.
   */
  private clientValue?: Client;

  /**
   * Cliente do banco de dados.
   */
  private get client(): Client {
    if (this.clientValue === undefined) {
      throw new EmptyError('Client was not created.');
    }
    return this.clientValue;
  }

  /**
   * Sufixo adicionado ao final do index para dados recebidos via interface IDatabasePushOnly
   */
  public pushOnlyIndexSuffix = '';

  /**
   * Grava um conjuntos de valores em única via, tipo log.
   * @param values Campos e valores.
   * @param extra Valores extra
   * @param indexSuffix Sufixo do índice no ElasticSearch
   */
  public async push(
    values: Record<string, PrimitiveValueType | Date | undefined>,
    extra?: unknown,
    indexSuffix?: string
  ): Promise<this> {
    indexSuffix = indexSuffix ?? this.pushOnlyIndexSuffix;
    const index = (
      this.configuration.indexPrefixTemplate + indexSuffix
    ).querystring({
      appName: ApplicationParameters.packageName,
      date: new Date().format({ mask: 'y-M-d' })
    });

    const separator = '__';

    const body: Record<string, unknown> = {
      ...HelperObject.flattenWithSafeType(values, separator),
      field: HelperObject.flattenWithSafeType(extra, separator)
    };

    for (const key in body) {
      if (key.endsWith(separator + 'date')) {
        delete body[key];
      }
    }

    await this.client.index({
      index,
      body
    });

    return this;
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
    if (this.clientValue !== undefined) {
      await this.clientValue.close();
      this.clientValue = undefined;
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
    this.clientValue = new Client(options);
    try {
      await this.clientValue.ping();
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

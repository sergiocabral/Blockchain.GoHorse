import { IApplicationParameters } from './Type/IApplicationParameters';
import { ApplicationDatabaseConfiguration } from './Configuration/ApplicationDatabaseConfiguration';
import { ElasticSearchDatabase } from '../Database/ElasticSearch/ElasticSearchDatabase';
import { IDatabase } from '../Database/IDatabase';
import { ConnectionState } from '@sergiocabral/helper';

/**
 * Gerencia os banco de dados da aplicação.
 */
export class ApplicationDatabase {
  /**
   * Construtor.
   * @param getConfiguration Configurações.
   * @param getParameters Parâmetros da instância.
   * @param loggerName Nome do logger para identificar dados no banco de dados.
   */
  public constructor(
    private readonly getConfiguration: () => ApplicationDatabaseConfiguration,
    private readonly getParameters: () => IApplicationParameters,
    private readonly loggerName: string
  ) {
    this.elasticsearch = new ElasticSearchDatabase(
      () => this.getConfiguration().elasticsearch
    );
    this.elasticsearch.pushOnlyIndexSuffix = `-[${loggerName}]`;
  }

  /**
   * Lista de banco de dados.
   */
  public get databases(): IDatabase[] {
    return [this.elasticsearch];
  }

  /**
   * ElasticSearch
   */
  public readonly elasticsearch: ElasticSearchDatabase;

  /**
   * Abre as conexões.
   */
  public async open(): Promise<void> {
    for (const database of this.databases) {
      try {
        await database.open();
      } catch (error) {
        // TODO: Prosseguir sem conexão
      }
    }
  }

  /**
   * Abre as conexões.
   */
  public async close(): Promise<void> {
    for (const database of this.databases) {
      if (database.state === ConnectionState.Ready) {
        await database.close();
      }
    }
  }
}

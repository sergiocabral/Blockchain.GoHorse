import { IApplicationParameters } from './Type/IApplicationParameters';
import { ApplicationDatabaseConfiguration } from './Configuration/ApplicationDatabaseConfiguration';
import { ElasticSearchDatabase } from '../Database/ElasticSearch/ElasticSearchDatabase';
import { IDatabase } from '../Database/IDatabase';
import { ConnectionState, Logger, LogLevel } from '@sergiocabral/helper';

/**
 * Gerencia os banco de dados da aplicação.
 */
export class ApplicationDatabase {
  /**
   * Contexto de log.
   */
  public static logContext = 'ApplicationDatabase';

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
    const elasticSearchDatabaseCanFail = true;
    this.elasticsearch = new ElasticSearchDatabase(
      () => this.getConfiguration().elasticsearch,
      elasticSearchDatabaseCanFail
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
    Logger.post(
      'Opening a total of {count} database connection(s).',
      {
        count: this.databases.length
      },
      LogLevel.Debug,
      ApplicationDatabase.logContext
    );
    for (const database of this.databases) {
      await database.open();
    }
  }

  /**
   * Abre as conexões.
   */
  public async close(): Promise<void> {
    const openedDatabases = this.databases.filter(
      database => database.state === ConnectionState.Ready
    );
    Logger.post(
      'Closing a total of {count} database connection(s).',
      {
        count: openedDatabases.length
      },
      LogLevel.Debug,
      ApplicationDatabase.logContext
    );
    for (const database of openedDatabases) {
      await database.close();
    }
  }
}

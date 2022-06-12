import { IApplicationParameters } from './Type/IApplicationParameters';
import { ApplicationDatabaseConfiguration } from './Configuration/ApplicationDatabaseConfiguration';
import {
  ConnectionState,
  Logger,
  LogLevel,
  Message
} from '@sergiocabral/helper';
import { ElasticSearchDatabase } from '@gohorse/npm-database-elaticsearch';
import { IDatabase } from '@gohorse/npm-database';
import { ApplicationStarted, ConfigurationReloaded } from '@gohorse/npm-core';

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

    Message.subscribe(
      ApplicationStarted,
      this.handleApplicationStarted.bind(this)
    );
    Message.subscribe(
      ConfigurationReloaded,
      this.handleConfigurationReloaded.bind(this)
    );
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
    const closedDatabases = this.databases.filter(
      database => database.state === ConnectionState.Closed
    );
    if (closedDatabases.length > 0) {
      Logger.post(
        'Opening a total of {count} database connection(s): {classList}',
        {
          count: closedDatabases.length,
          classList: closedDatabases.map(database => database.constructor.name)
        },
        LogLevel.Debug,
        ApplicationDatabase.logContext
      );
      for (const database of closedDatabases) {
        await database.open();
      }
    } else {
      Logger.post(
        'There were no database connections to open.',
        undefined,
        LogLevel.Debug,
        ApplicationDatabase.logContext
      );
    }
  }

  /**
   * Abre as conexões.
   */
  public async close(): Promise<void> {
    const opendedDatabases = this.databases.filter(
      database => database.state === ConnectionState.Ready
    );
    if (opendedDatabases.length > 0) {
      Logger.post(
        'Closing a total of {count} database connection(s): {classList}',
        {
          count: opendedDatabases.length,
          classList: opendedDatabases.map(database => database.constructor.name)
        },
        LogLevel.Debug,
        ApplicationDatabase.logContext
      );
      for (const database of opendedDatabases) {
        await database.close();
      }
    } else {
      Logger.post(
        'There were no database connections to close.',
        undefined,
        LogLevel.Debug,
        ApplicationDatabase.logContext
      );
    }
  }

  /**
   * Handle: ApplicationStarted
   */
  private handleApplicationStarted(): void {
    Logger.post(
      'There are a total of {count} database connection(s) configured in the application: {classList}',
      {
        count: this.databases.length,
        classList: this.databases.map(database => database.constructor.name)
      },
      LogLevel.Verbose,
      ApplicationDatabase.logContext
    );
  }

  /**
   * Handle: ConfigurationReloaded
   */
  private async handleConfigurationReloaded(): Promise<void> {
    await this.open();
  }
}

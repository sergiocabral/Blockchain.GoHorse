import { LoggerCollection } from '@gohorse/npm-log';
import { ApplicationLoggerCollectionConfiguration } from './Configuration/ApplicationLoggerCollectionConfiguration';
import { Logger, LogLevel } from '@sergiocabral/helper';
import { LogToConsole } from '@gohorse/npm-log-console';
import { LogToFile } from '@gohorse/npm-log-file';
import { LogToDatabase } from '../Log/Database/LogToDatabase';
import { IApplicationParameters } from './Type/IApplicationParameters';
import { IDatabasePushOnly } from '../Database/IDatabasePushOnly';
import { ILoggerToStream } from '@gohorse/npm-log/js/Log/ILoggerToStream';

/**
 * Gerencia o logger da aplicação.
 */
export class ApplicationLogger {
  /**
   * Construtor.
   * @param getConfiguration Configurações.
   * @param getParameters Parâmetros da instância.
   * @param loggerDatabase Database para o logger.
   */
  public constructor(
    private readonly getConfiguration: () => ApplicationLoggerCollectionConfiguration,
    private readonly getParameters: () => IApplicationParameters,
    private readonly loggerDatabase: IDatabasePushOnly | undefined
  ) {
    const defaultLogLevel =
      Logger.defaultLogger?.defaultLogLevel ?? LogLevel.Debug;

    const loggers: ILoggerToStream[] = [
      new LogToConsole(
        () => this.getConfiguration().toConsole,
        getParameters,
        defaultLogLevel
      ),
      new LogToFile(
        () => this.getConfiguration().toFile,
        getParameters,
        defaultLogLevel
      )
    ];

    if (loggerDatabase !== undefined) {
      loggers.push(
        new LogToDatabase(
          loggerDatabase,
          () => this.getConfiguration().toDatabase,
          getParameters,
          defaultLogLevel
        )
      );
    }

    Logger.defaultLogger = this.logger =
      new LoggerCollection<ApplicationLoggerCollectionConfiguration>(
        getConfiguration,
        getParameters,
        ...loggers
      );
  }

  /**
   * Logger da aplicação que gerencia múltiplos loggers.
   */
  protected readonly logger: LoggerCollection<ApplicationLoggerCollectionConfiguration>;

  /**
   * Configura o serviço de log.
   */
  public configure(): void {
    const parameters = this.getParameters();
    this.logger.configure();
    this.logger.defaultValues['applicationInstanceId'] = parameters.id;
    this.logger.defaultValues['applicationName'] = parameters.packageName;
    this.logger.defaultValues['applicationVersion'] = parameters.packageVersion;
  }

  /**
   * Despeja no console qualquer log presente no buffer.
   */
  public flushToConsole(): void {
    this.logger.flushToConsole();
  }
}
import {
  ILogMessageAndData,
  Logger,
  LogLevel,
  LogWriterToPersistent,
  Message
} from '@sergiocabral/helper';
import { LogToDatabaseConfiguration } from './LogToDatabaseConfiguration';
import {
  ApplicationTerminated,
  GlobalDefinition,
  IInstanceParameters
} from '@gohorse/npm-core';
import { IDatabasePushOnly } from '../../Database/IDatabasePushOnly';
import { LoggerToStream } from '@gohorse/npm-log';

export class LogToDatabase extends LoggerToStream<
  LogWriterToPersistent,
  LogToDatabaseConfiguration
> {
  /**
   * Contexto do log.
   */
  private static logContext = 'LogToDatabase';

  /**
   * Construtor.
   * @param database Conexão com banco de dados.
   * @param getConfiguration – Configurações do log writer que será criado
   * @param getInstanceParameters – Parâmetros da instância em execução
   * @param defaultLogLevel Nível padrão de log quando não informado
   * @param waitInMillisecondsOnError waitInMillisecondsOnError – Espera em milissegundos em caso de erro.
   */
  public constructor(
    private readonly database: IDatabasePushOnly,
    getConfiguration: () => LogToDatabaseConfiguration,
    getInstanceParameters: () => IInstanceParameters,
    defaultLogLevel: LogLevel,
    private readonly waitInMillisecondsOnError?: number
  ) {
    super(getConfiguration, getInstanceParameters, defaultLogLevel);
    Message.subscribe(
      ApplicationTerminated,
      this.handleApplicationTerminated.bind(this)
    );
  }

  /**
   * Tipo (nome) do fluxo.
   */
  public override get type(): string {
    return LogToDatabase.logContext;
  }

  /**
   * Instância do logger.
   */
  private logWriterToPersistent?: LogWriterToPersistent;

  /**
   * Cria a instância do logger.
   */
  protected override createInstance(): LogWriterToPersistent {
    return (this.logWriterToPersistent = new LogWriterToPersistent(
      this.database,
      this.saveToPersistent.bind(this)
    ));
  }

  /**
   * Configura a instância do logger.
   * @param configuration Configuração.
   * @param instanceParameters Parâmetros da instância em execução.
   */
  protected override configureInstance(
    configuration: LogToDatabaseConfiguration,
    instanceParameters: IInstanceParameters
  ): void {
    void instanceParameters;

    Logger.post(
      'Setting logger "{logWriterType}" waitInMillisecondsOnError: {timeMilliSeconds}.',
      {
        logWriterType: this.type,
        timeMilliSeconds: configuration.waitInMillisecondsOnError
      },
      LogLevel.Debug,
      LogToDatabase.logContext
    );
    this.instance.waitInMillisecondsOnError =
      configuration.waitInMillisecondsOnError;
    this.instance.waitInMillisecondsIfNotReady =
      GlobalDefinition.TIME_OF_ONE_SECOND_IN_MILLISECONDS;
  }

  /**
   * Escreve o log de fato.
   */
  private async saveToPersistent(
    messageAndData: ILogMessageAndData
  ): Promise<void> {
    await this.database.push(
      {
        logTimestamp: messageAndData.logMessage.timestamp,
        logMessage: messageAndData.logMessage.message,
        logMessageTemplate: messageAndData.messageTemplate,
        logLevel: LogLevel[messageAndData.logMessage.level],
        logSection: messageAndData.logMessage.section
      },
      messageAndData.values
    );
  }

  /**
   * Handle: ApplicationTerminated
   */
  private async handleApplicationTerminated(): Promise<void> {
    if (this.logWriterToPersistent !== undefined) {
      Logger.post(
        'The application has been terminated. This log instance "{className}" will be disabled. Pending messages will be flushed if possible or discarded.',
        {
          className: this.constructor.name
        },
        LogLevel.Debug,
        LogToDatabase.logContext
      );
      this.logWriterToPersistent.enabled = false;
      await this.logWriterToPersistent.flush();
      this.logWriterToPersistent.discard();
    }
  }
}

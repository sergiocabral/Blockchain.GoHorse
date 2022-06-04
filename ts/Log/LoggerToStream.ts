import { LoggerToStreamConfiguration } from './LoggerToStreamConfiguration';
import {
  EmptyError,
  ILogWriter,
  InvalidExecutionError,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import { ILoggerToStream } from './ILoggerToStream';
import { IInstanceParameters } from '@gohorse/npm-core';

/**
 * Logger para determinada fluxo de mensagens de log.
 */
export abstract class LoggerToStream<
  TLogWriter extends ILogWriter,
  TLogConfiguration extends LoggerToStreamConfiguration
> implements ILoggerToStream<TLogWriter>
{
  /**
   * Contexto do log.
   */
  private static logContext2 = 'LoggerToStream';

  /**
   *
   * @param getConfiguration Configurações do log writer que será criado
   * @param getInstanceParameters Parâmetros da instância em execução
   * @param defaultLogLevel Nível padrão de log quando não informado
   */
  public constructor(
    private readonly getConfiguration: () => TLogConfiguration,
    private readonly getInstanceParameters: () => IInstanceParameters,
    private readonly defaultLogLevel: LogLevel
  ) {}

  /**
   * Tipo (nome) do fluxo.
   */
  public abstract get type(): string;

  /**
   * Cria a instância do logger.
   */
  protected abstract createInstance(): TLogWriter;

  /**
   * Configura a instância do logger.
   * @param configuration Configuração.
   * @param instanceParameters Parâmetros da instãncia em execução.
   */
  protected abstract configureInstance(
    configuration: TLogConfiguration,
    instanceParameters: IInstanceParameters
  ): void;

  /**
   * Instância do logger.
   */
  private instanceValue?: TLogWriter;

  /**
   * Instância do logger.
   */
  public get instance(): TLogWriter {
    if (this.instanceValue === undefined) {
      throw new EmptyError('Must first create() and configure().');
    }
    return this.instanceValue;
  }

  /**
   * Logger base para configurar esta instância.
   */
  private baseLogger?: ILogWriter;

  /**
   * Define um logger base para configurar esta instância.
   * Serão atribuídas à instância as referências `customFactoryMessage` e `defaultValues` do logger base.
   */
  public setBaseLogger(baseLogger: ILogWriter | undefined): this {
    this.baseLogger = baseLogger;
    return this;
  }

  /**
   * Cria e configura o logger.
   */
  public create(): this {
    if (this.instanceValue !== undefined) {
      throw new InvalidExecutionError('Already created.');
    }

    Logger.post(
      'Creating instance of "{logWriterType}" logger.',
      {
        logWriterType: this.type
      },
      LogLevel.Verbose,
      LoggerToStream.logContext2
    );

    this.instanceValue = this.createInstance();
    this.configure();

    return this;
  }

  /**
   * Reconfigura o logger
   */
  public configure(): this {
    if (this.instanceValue === undefined) {
      throw new EmptyError('Must first create().');
    }

    Logger.post(
      'Loading "{logWriterType}" logger configuration.',
      {
        logWriterType: this.type
      },
      LogLevel.Verbose,
      LoggerToStream.logContext2
    );

    const configuration = this.getConfiguration();
    const instanceParameters = this.getInstanceParameters();

    this.configureInstance(configuration, instanceParameters);

    Logger.post(
      'Setting logger "{logWriterType}" default level: {logLevel}.',
      {
        logWriterType: this.type,
        logLevel: LogLevel[this.defaultLogLevel]
      },
      LogLevel.Debug,
      LoggerToStream.logContext2
    );
    this.instanceValue.defaultLogLevel = this.defaultLogLevel;

    Logger.post(
      'Setting logger "{logWriterType}" minimum level: {logLevel}.',
      {
        logWriterType: this.type,
        logLevel: LogLevel[configuration.minimumLevelValue]
      },
      LogLevel.Debug,
      LoggerToStream.logContext2
    );
    this.instanceValue.minimumLevel = configuration.minimumLevelValue;

    Logger.post(
      'Setting logger "{logWriterType}" enabled: {isEnabled}.',
      {
        logWriterType: this.type,
        isEnabled: configuration.enabled
      },
      LogLevel.Debug,
      LoggerToStream.logContext2
    );
    this.instanceValue.enabled = configuration.enabled;

    if (this.baseLogger !== undefined) {
      this.instanceValue.defaultValues = this.baseLogger.defaultValues;

      this.instanceValue.customFactoryMessage =
        this.baseLogger.customFactoryMessage?.bind(this.baseLogger);
    }

    return this;
  }
}

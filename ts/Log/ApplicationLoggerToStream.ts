import { LoggerToStreamConfiguration } from './LoggerToStreamConfiguration';
import {
  EmptyError,
  ILogWriter,
  InvalidExecutionError,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import { ApplicationParameters } from '../Core/ApplicationParameters';
import { IApplicationLoggerToStream } from './IApplicationLoggerToStream';

/**
 * Logger da aplicação para determinada fluxo de mensagens de log.
 */
export abstract class ApplicationLoggerToStream<
  TLogWriter extends ILogWriter,
  TLogConfiguration extends LoggerToStreamConfiguration
> implements IApplicationLoggerToStream<TLogWriter>
{
  /**
   * Contexto do log.
   */
  private static logContext2 = 'ApplicationLoggerStream';

  /**
   *
   * @param applicationLogger Logger principal da aplicação.
   * @param getConfiguration Configurações do log writer que será criado
   * @param getApplicationParameters Parâmetros da aplicação
   */
  public constructor(
    private readonly applicationLogger: ILogWriter,
    private readonly getConfiguration: () => TLogConfiguration,
    private readonly getApplicationParameters: () => ApplicationParameters
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
   * @param applicationParameters Parâmetros da aplicação.
   */
  protected abstract configureInstance(
    configuration: TLogConfiguration,
    applicationParameters: ApplicationParameters
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
      ApplicationLoggerToStream.logContext2
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
      ApplicationLoggerToStream.logContext2
    );

    const configuration = this.getConfiguration();
    const applicationParameters = this.getApplicationParameters();

    this.configureInstance(configuration, applicationParameters);

    Logger.post(
      'Setting logger "{logWriterType}" minimum level: {value}.',
      {
        logWriterType: this.type,
        value: configuration.minimumLevel
      },
      LogLevel.Debug,
      ApplicationLoggerToStream.logContext2
    );
    this.instanceValue.minimumLevel = configuration.minimumLevelValue;

    Logger.post(
      'Setting logger "{logWriterType}" enabled: {value}.',
      {
        logWriterType: this.type,
        value: configuration.enabled
      },
      LogLevel.Debug,
      ApplicationLoggerToStream.logContext2
    );
    this.instanceValue.enabled = configuration.enabled;

    this.instanceValue.defaultValues = this.applicationLogger.defaultValues;

    this.instanceValue.customFactoryMessage =
      this.applicationLogger.customFactoryMessage?.bind(this.applicationLogger);

    return this;
  }
}

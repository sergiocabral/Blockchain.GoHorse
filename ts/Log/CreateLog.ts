import { ApplicationParameters } from '../Core/ApplicationParameters';
import { LogConfiguration } from './LogConfiguration';
import { ILogWriter, Logger, LogLevel } from '@sergiocabral/helper';

/**
 * Classe capaz de criar uma instância de log.
 */
export abstract class CreateLog<TLogConfiguration extends LogConfiguration> {
  /**
   * Contexto do log.
   */
  private static logContext2 = 'CreateLog';

  /**
   * Construtor.
   * @param logWriterBase LogWriter base.
   */
  public constructor(private logWriterBase: ILogWriter) {}

  /**
   * Cria uma instância de log.
   * @param configuration
   * @param aplicationParameters
   */
  public create(
    configuration: TLogConfiguration,
    aplicationParameters: ApplicationParameters
  ): ILogWriter {
    return this.configure(
      this.createInstance(configuration, aplicationParameters),
      configuration
    );
  }

  /**
   * Cria uma instância de log.
   * @param configuration
   * @param aplicationParameters
   */
  protected abstract createInstance(
    configuration: TLogConfiguration,
    aplicationParameters: ApplicationParameters
  ): ILogWriter;

  /**
   * Configura uma instância de log.
   */
  private configure(
    logWriter: ILogWriter,
    configuration: LogConfiguration
  ): ILogWriter {
    Logger.post(
      'Setting minimum logging level for {logStream} to {logLevel}.',
      {
        logStream: logWriter.constructor.name,
        logLevel: configuration.minimumLevel
      },
      LogLevel.Debug,
      CreateLog.logContext2
    );

    logWriter.enabled = configuration.enabled;
    logWriter.minimumLevel = configuration.minimumLevelValue;
    logWriter.defaultValues = this.logWriterBase.defaultValues;
    logWriter.customFactoryMessage =
      this.logWriterBase.customFactoryMessage?.bind(this.logWriterBase);

    return logWriter;
  }
}

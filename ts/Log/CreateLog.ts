import { LogConfiguration } from './LogConfiguration';
import { ILogWriter, Logger, LogLevel } from '@sergiocabral/helper';
import { ICreateLogParameters } from './ICreateLogParameters';

/**
 * Classe capaz de criar uma instância de log.
 */
export abstract class CreateLog<TLogConfiguration extends LogConfiguration> {
  /**
   * Contexto do log.
   */
  private static logContext2 = 'CreateLog';

  /**
   * Cria uma instância de log.
   * @param parameters Parâmetros de configuração.
   */
  public create(
    parameters: ICreateLogParameters<TLogConfiguration>
  ): ILogWriter {
    return this.configure(parameters, this.createInstance(parameters));
  }

  /**
   * Cria uma instância de log.
   * @param parameters Parâmetros de configuração.
   */
  protected abstract createInstance(
    parameters: ICreateLogParameters<TLogConfiguration>
  ): ILogWriter;

  /**
   * Configura uma instância de log.
   * @param parameters Parâmetros de configuração.
   * @param logWriter Log writer que deve ser configurado.
   */
  private configure(
    parameters: ICreateLogParameters<TLogConfiguration>,
    logWriter: ILogWriter
  ): ILogWriter {
    Logger.post(
      'Setting minimum logging level for {logStream} to {logLevel}.',
      {
        logStream: logWriter.constructor.name,
        logLevel: parameters.configuration.minimumLevel
      },
      LogLevel.Debug,
      CreateLog.logContext2
    );

    logWriter.enabled = parameters.configuration.enabled;
    logWriter.minimumLevel = parameters.configuration.minimumLevelValue;
    logWriter.defaultValues = parameters.logWriterBase.defaultValues;
    logWriter.customFactoryMessage =
      parameters.logWriterBase.customFactoryMessage?.bind(
        parameters.logWriterBase
      );

    return logWriter;
  }
}

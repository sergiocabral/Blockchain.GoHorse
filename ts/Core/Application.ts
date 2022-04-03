import { Argument } from './Argument';
import { ApplicationConfiguration } from './ApplicationConfiguration';
import { EmptyError, Logger, LogLevel } from '@sergiocabral/helper';
import fs from 'fs';

/**
 * Esboço de uma aplicação executável.
 */
export abstract class Application<
  TConfiguration extends ApplicationConfiguration = ApplicationConfiguration
> {
  /**
   * Contexto do log.
   */
  private static logContext = 'Application';

  /**
   * Construtor.
   */
  public constructor(onFinished: (error: unknown | undefined) => void) {
    Logger.post(
      'Application instance created.',
      undefined,
      LogLevel.Debug,
      Application.logContext
    );

    this.argument = new Argument(process.argv);
    setImmediate(() => void this.start().then(onFinished).catch(onFinished));
  }

  /**
   * Informações sobre a linha de comando.
   */
  public readonly argument: Argument;

  /**
   * Configurações da aplicação.
   */
  private configurationValue?: TConfiguration;

  /**
   * Tipo da Configurações da aplicação;
   */
  protected abstract get configurationType(): new (
    json?: unknown
  ) => TConfiguration;

  /**
   * Configurações da aplicação.
   */
  public configuration(): TConfiguration {
    if (this.configurationValue === undefined) {
      throw new EmptyError('Application configuration not loaded.');
    }
    return this.configurationValue;
  }

  /**
   * Inicia a aplicação.
   */
  private async start(): Promise<void> {
    Logger.post(
      '"{type}" application started.',
      {
        type: this.constructor.name
      },
      LogLevel.Debug,
      Application.logContext
    );

    await this.loadConfiguration();

    Logger.post(
      '"{type}" application finished.',
      {
        type: this.constructor.name
      },
      LogLevel.Debug,
      Application.logContext
    );
  }

  /**
   * Carrega o arquivo de configuração da aplicação.
   */
  private async loadConfiguration(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Logger.post(
        'Loading application configuration.',
        undefined,
        LogLevel.Debug,
        Application.logContext
      );

      const configurationExists = fs.existsSync(
        this.argument.configurationFilePath
      );
      const configuration: TConfiguration = configurationExists
        ? ApplicationConfiguration.loadAndUpdateFile<TConfiguration>(
            this.configurationType,
            this.argument.configurationFilePath
          )
        : ApplicationConfiguration.createNewFile<TConfiguration>(
            this.configurationType,
            this.argument.configurationFilePath
          );

      try {
        ApplicationConfiguration.validate(configuration);

        Logger.post(
          'Application configuration loaded.',
          undefined,
          LogLevel.Debug,
          Application.logContext
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

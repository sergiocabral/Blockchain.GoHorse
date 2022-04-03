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
   * Contexto do log nesta classe.
   */
  private static logSection = 'Application';

  /**
   * Construtor.
   */
  public constructor() {
    Logger.post(
      'Application instance created.',
      undefined,
      LogLevel.Debug,
      Application.logSection
    );

    this.argument = new Argument(process.argv);
    setImmediate(() => void this.start());
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
      'Application starting.',
      undefined,
      LogLevel.Debug,
      Application.logSection
    );

    await this.loadConfiguration();

    Logger.post(
      'Application started.',
      undefined,
      LogLevel.Debug,
      Application.logSection
    );
  }

  /**
   * Carrega o arquivo de configuração da aplicação.
   */
  private async loadConfiguration(): Promise<void> {
    return new Promise<void>(resolve => {
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

      resolve();
    });
  }
}

import { ApplicationParameters } from './ApplicationParameters';
import { ApplicationConfiguration } from './ApplicationConfiguration';
import {
  EmptyError,
  HelperFileSystem,
  Logger,
  LogLevel,
  ResultEvent
} from '@sergiocabral/helper';
import fs from 'fs';
import { Definition } from '../Definition';

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
  public constructor(onFinished: ResultEvent) {
    this.parameters = new ApplicationParameters(process.argv);

    Logger.post(
      'Application instance created with id "{id}".',
      { id: this.parameters.applicationInstanceIdentifier },
      LogLevel.Debug,
      Application.logContext
    );

    setImmediate(() => void this.ready(onFinished));
  }

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
   * Parâmetros de execução da aplicação.
   */
  protected readonly parameters: ApplicationParameters;

  /**
   * Inicia a aplicação.
   */
  protected abstract start(): Promise<void> | void;

  /**
   * Finaliza a aplicação.
   */
  protected abstract stop(): Promise<void> | void;

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
   * Chamado quando a instância está pronta para uso.
   */
  private async ready(onFinished: ResultEvent): Promise<void> {
    const signalToTerminate = this.parameters.hasArgumentName('/stop');
    const goAhead = signalToTerminate
      ? this.kill.bind(this)
      : this.execute.bind(this);
    try {
      await goAhead();
      onFinished(true);
    } catch (error) {
      onFinished(false, error);
    }
  }

  /**
   * Inicia a aplicação.
   */
  private async execute(): Promise<void> {
    this.createRunningFlagFile();
    await this.loadConfiguration();

    Logger.post(
      '"{type}" application started.',
      {
        type: this.constructor.name
      },
      LogLevel.Debug,
      Application.logContext
    );

    await this.start();

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
        this.parameters.configurationFile
      );
      const configuration: TConfiguration = configurationExists
        ? ApplicationConfiguration.loadAndUpdateFile<TConfiguration>(
            this.configurationType,
            this.parameters.configurationFile
          )
        : ApplicationConfiguration.createNewFile<TConfiguration>(
            this.configurationType,
            this.parameters.configurationFile
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

  /**
   * Cria um arquivo em disco que sinaliza que esta instância está em execução.
   * A remoção do arquivo resulta na finalização da aplicação.
   */
  private createRunningFlagFile(): void {
    Logger.post(
      'Creating application instance execution flag file: {path}',
      {
        path: this.parameters.runningFlagFile
      },
      LogLevel.Debug,
      Application.logContext
    );

    HelperFileSystem.createRecursive(
      this.parameters.runningFlagFile,
      `
FLAG FILE

This file signals that the application should continue running.

If this file no longer exists, the application is terminated.

Application
 - Name: ${this.parameters.applicationName} 
 - Instance: ${this.parameters.applicationInstanceIdentifier}
`.trim()
    );

    // TODO: Utilizar FileSystemMonitoring

    Logger.post(
      'Monitoring every {seconds} seconds for the presence of the application instance execution flag file: {path}',
      {
        seconds: Definition.INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_SECONDS,
        path: this.parameters.runningFlagFile
      },
      LogLevel.Debug,
      Application.logContext
    );
  }

  /**
   * Sinaliza que a instância devem ser finalizadas.
   * @private
   */
  private async kill(): Promise<void> {
    return new Promise<void>(resolve => {
      console.log('HOW TO KILL?');
      resolve();
    });
  }
}

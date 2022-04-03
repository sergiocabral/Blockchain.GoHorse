import { Argument } from './Argument';
import { ApplicationConfiguration } from './ApplicationConfiguration';
import {
  EmptyError,
  Logger,
  LogLevel,
  ResultEvent
} from '@sergiocabral/helper';
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
  public constructor(onFinished: ResultEvent) {
    Logger.post(
      'Application instance created.',
      undefined,
      LogLevel.Debug,
      Application.logContext
    );

    this.argument = new Argument(process.argv);
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
   * Informações sobre a linha de comando.
   */
  protected readonly argument: Argument;

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
    const signalToTerminate = this.argument.hasArgumentName('/stop');
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

import { ApplicationParameters } from './ApplicationParameters';
import { ApplicationConfiguration } from './ApplicationConfiguration';
import {
  EmptyError,
  FileSystemMonitoring,
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
      await onFinished(true);
    } catch (error) {
      await onFinished(false, error);
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

    const monitoring = new FileSystemMonitoring(
      this.parameters.runningFlagFile,
      Definition.INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_SECONDS
    );

    monitoring.onDeleted.add(async () => {
      monitoring.stop();
      await this.stop();
    });

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
      const ids = this.parameters
        .getArgumentValues('/id')
        .filter(value => value !== undefined)
        .join(',')
        .split(',')
        .filter(value => value.length > 0)
        .map(value => value.trim());

      if (ids.length === 0) {
        Logger.post(
          'It is necessary to inform the id of the instance that will be terminated. Use `/id=<id1>,<id2>,<id3>` to specify the instances or `/id=*` to end all. Instances currently running: {instancesIds}',
          {
            instancesIds: Object.keys(this.getRunningInstances()).join(', ')
          },
          LogLevel.Error,
          Application.logContext
        );
      }

      // TODO: Continuar daqui exibindo id das instancias a finalizar

      Logger.post(
        'Informed ids: {ids}. Executing ids: {instancesIds}',
        {
          ids,
          instancesIds: Object.keys(this.getRunningInstances()).join(', ')
        },
        LogLevel.Information,
        Application.logContext
      );

      resolve();
    });
  }

  /**
   * Retorna os ids das instâncias em execução.
   */
  private getRunningInstances(): Record<string, string> {
    const regexMatches = fs
      .readdirSync(this.parameters.inicialDirectory)
      .map(file => this.parameters.regexRunningFlagFileId.exec(file))
      .filter(regexMatch => regexMatch !== null) as RegExpExecArray[];
    // TODO: Usar reduce?

    const result: Record<string, string> = {};
    for (const regexMatch of regexMatches) {
      result[regexMatch[1]] = regexMatch[0];
    }

    return result;
  }
}

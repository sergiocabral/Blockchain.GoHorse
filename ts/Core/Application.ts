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

    Logger.post(
      'Execution Mode: {mode}',
      {
        mode: signalToTerminate
          ? 'terminate other instances'
          : 'start this instance'
      },
      LogLevel.Debug,
      Application.logContext
    );

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

    monitoring.onDeleted.add(
      async () => await this.onDeletedRunningFlagFile(monitoring)
    );

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
   * Evento ao excluir o arquivo de sinalização de execução.
   */
  private async onDeletedRunningFlagFile(
    monitoring: FileSystemMonitoring
  ): Promise<void> {
    monitoring.stop();
    Logger.post(
      'The execution signal file was deleted.',
      undefined,
      LogLevel.Debug,
      Application.logContext
    );
    await this.stop();
  }

  /**
   * Sinaliza que a instância devem ser finalizadas.
   * @private
   */
  private async kill(): Promise<void> {
    return new Promise<void>(resolve => {
      const receivedIds = this.parameters
        .getArgumentValues('/id')
        .filter(value => value !== undefined)
        .join(',')
        .split(',')
        .filter(value => value.length > 0)
        .map(value => value.trim());

      const runingIds = this.getRunningInstances();

      if (receivedIds.length === 0) {
        Logger.post(
          'It is necessary to inform the id of the instance that will be terminated. Use `/id=<id1>,<id2>,<id3>` to specify the instances or `/id=*` to end all. Instances currently running: {runingIds}',
          {
            runingIds: Object.keys(runingIds).join(', ')
          },
          LogLevel.Error,
          Application.logContext
        );
      } else {
        const killAll = receivedIds.includes('*');

        if (killAll) {
          Logger.post(
            'Terminating all instances because of *.',
            undefined,
            LogLevel.Debug,
            Application.logContext
          );
        }

        const instancesToKill: Record<string, string> = killAll
          ? runingIds
          : receivedIds.reduce<Record<string, string>>((result, id) => {
              result[id] = this.parameters.getRunningFlagFile(id);
              return result;
            }, {});

        if (Object.keys(instancesToKill).length === 0) {
          Logger.post(
            'No instances have been found to be terminated.',
            undefined,
            LogLevel.Information,
            Application.logContext
          );
        } else {
          let countKill = 0;
          for (const instanceId in instancesToKill) {
            let instanceFile = instancesToKill[instanceId];
            if (fs.existsSync(instanceFile)) {
              try {
                instanceFile = fs.realpathSync(instanceFile);
                fs.unlinkSync(instanceFile);
                countKill++;
                Logger.post(
                  'Terminated instance "{instanceId}" by deleting execution signal file: {instanceFile}',
                  {
                    instanceId,
                    instanceFile
                  },
                  LogLevel.Information,
                  Application.logContext
                );
              } catch (error) {
                Logger.post(
                  'Error to terminate instance "{instanceId}" by deleting execution signal file: {instanceFile}. ERROR: {error}',
                  {
                    instanceId,
                    instanceFile,
                    error
                  },
                  LogLevel.Error,
                  Application.logContext
                );
              }
            } else {
              Logger.post(
                'Instance "{instanceId}" is not running to terminate.',
                {
                  instanceId
                },
                LogLevel.Warning,
                Application.logContext
              );
            }
          }

          Logger.post(
            'Total instances terminated: {countKill}',
            {
              countKill
            },
            LogLevel.Debug,
            Application.logContext
          );
        }
      }

      resolve();
    });
  }

  /**
   * Retorna os ids das instâncias em execução.
   */
  private getRunningInstances(): Record<string, string> {
    return fs
      .readdirSync(this.parameters.inicialDirectory)
      .map(file => this.parameters.regexRunningFlagFileId.exec(file))
      .reduce<Record<string, string>>((result, regexMatch) => {
        if (regexMatch !== null) {
          result[regexMatch[1]] = regexMatch[0];
        }
        return result;
      }, {});
  }
}

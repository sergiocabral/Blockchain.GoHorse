import { ApplicationParameters } from './ApplicationParameters';
import { ApplicationConfiguration } from './ApplicationConfiguration';
import {
  EmptyError,
  FileSystemMonitoring,
  HelperFileSystem,
  HelperList,
  HelperObject,
  HelperText,
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel,
  ResultEvent
} from '@sergiocabral/helper';
import fs from 'fs';
import { Definition } from '../Definition';
import { IApplication } from './IApplication';
import { ApplicationLogger } from '../Log/ApplicationLogger';
import { ApplicationExecutionMode } from './ApplicationExecutionMode';
import { MessageRouter } from '../MessageBetweenInstances/MessageRouter';
import * as os from 'os';

/**
 * Estados de execução de uma aplicação.
 */
type AplicationState = 'running' | 'stoping' | 'stoped';

/**
 * Esboço de uma aplicação executável.
 */
export abstract class Application<
  TConfiguration extends ApplicationConfiguration = ApplicationConfiguration
> implements IApplication
{
  /**
   * Contexto do log.
   */
  private static logContext2 = 'Application';

  /**
   * Tipo da Configurações da aplicação;
   */
  protected abstract get configurationType(): new (
    json?: unknown
  ) => TConfiguration;

  /**
   * Quando a aplicação é iniciada.
   */
  protected abstract onStart(): Promise<void> | void;

  /**
   * Quando a aplicação é finalizada.
   */
  protected abstract onStop(): Promise<void> | void;

  /**
   * Construtor.
   */
  public constructor() {
    Logger.defaultLogger = this.logger = new ApplicationLogger();

    Logger.post(
      '"{type}" application instance created with id "{id}".',
      {
        id: ApplicationParameters.applicationInstanceIdentifier,
        type: this.constructor.name
      },
      LogLevel.Debug,
      Application.logContext2
    );

    this.parameters = new ApplicationParameters(process.argv);

    const runningFlagFileMonitoringStarted = false;
    this.runningFlagFileMonitoring = new FileSystemMonitoring(
      this.parameters.runningFlagFile,
      Definition.INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_SECONDS,
      runningFlagFileMonitoringStarted
    );
    this.runningFlagFileMonitoring.onDeleted.add(
      this.onDeletedRunningFlagFile.bind(this)
    );

    this.executionMode = this.parameters.hasArgumentName(
      Definition.ARGUMENT_STOP
    )
      ? ApplicationExecutionMode.Kill
      : this.parameters.hasArgumentName(Definition.ARGUMENT_RELOAD)
      ? ApplicationExecutionMode.ReloadConfiguration
      : ApplicationExecutionMode.Start;
  }

  /**
   * Evento ao finalizar a aplicação e liberar recursos.
   */
  public onDispose: Set<ResultEvent> = new Set<ResultEvent>();

  /**
   * Configurações da aplicação.
   */
  private configurationValue?: TConfiguration;

  /**
   * Configurações JSON da aplicação.
   */
  public get configuration(): TConfiguration {
    if (this.configurationValue === undefined) {
      throw new EmptyError('Application configuration not loaded.');
    }
    return this.configurationValue;
  }

  /**
   * Parâmetros de execução da aplicação.
   */
  public readonly parameters: ApplicationParameters;

  /**
   * Sinaliza se a aplicação está em execução.
   */
  public get isRunning(): boolean {
    return this.aplicationState !== 'stoped';
  }

  /**
   * Estado de execução da aplicação.
   */
  private aplicationState: AplicationState = 'stoped';

  /**
   * Modo de execução da aplicação.
   */
  private readonly executionMode: ApplicationExecutionMode;

  /**
   * Monitoramento do arquivo de sinalização de execução.
   */
  private readonly runningFlagFileMonitoring: FileSystemMonitoring;

  /**
   * Logger principal da aplicação.
   */
  protected readonly logger: ApplicationLogger;

  /**
   * Inicia a execução da aplicação.
   */
  public async run(): Promise<void> {
    if (
      this.aplicationState === 'running' ||
      this.aplicationState === 'stoping'
    ) {
      throw new InvalidExecutionError('Already started or stoping.');
    }

    this.aplicationState = 'running';

    Logger.post(
      'Application started in mode: {mode}',
      {
        mode: this.executionMode
      },
      LogLevel.Debug,
      Application.logContext2
    );

    const goAhead =
      this.executionMode === ApplicationExecutionMode.Start
        ? this.executeThisInstance.bind(this)
        : this.sendMessageToOtherInstances.bind(this);

    try {
      await this.loadConfiguration();
      this.configureLogger();

      await goAhead();
      await this.stop();
    } catch (error) {
      await this.stop(error);
      this.logger.flushToConsole();
    }
  }

  /**
   * Inicia a aplicação.
   */
  private async executeThisInstance(): Promise<void> {
    this.createRunningFlagFile();
    await this.onStart();
  }

  /**
   * Sinaliza que a instância devem ser finalizadas.
   * @private
   */
  private async sendMessageToOtherInstances(): Promise<void> {
    let instanceIds = this.parameters
      .getArgumentValues(Definition.ARGUMENT_INSTANCE_ID)
      .filter(value => value !== undefined)
      .join(',')
      .split(',')
      .filter(value => value.length > 0)
      .map(value => value.trim());

    if (instanceIds.length === 0) {
      Logger.post(
        `It is necessary to inform the id of the instance that will be affected. Use \`${Definition.ARGUMENT_INSTANCE_ID}=instanceId1,instanceId2,instanceId3\` to specify the instances or \`${Definition.ARGUMENT_INSTANCE_ID}=${Definition.ARGUMENT_VALUE_FOR_ALL}\` to affect all.`,
        undefined,
        LogLevel.Error,
        Application.logContext2
      );

      const runingInstances = Application.getRunningInstances();
      const runingIds = Object.keys(runingInstances).join(',');
      if (runingIds !== '') {
        Logger.post(
          `Instances currently running: {runingIds}`,
          {
            runingIds
          },
          LogLevel.Information,
          Application.logContext2
        );
      } else {
        Logger.post(
          `But there is no instance currently running.`,
          undefined,
          LogLevel.Information,
          Application.logContext2
        );
      }
    } else {
      const affectAll = instanceIds.includes(Definition.ARGUMENT_VALUE_FOR_ALL);

      if (affectAll) {
        Logger.post(
          `Affecting all instances because of ${Definition.ARGUMENT_VALUE_FOR_ALL}.`,
          undefined,
          LogLevel.Debug,
          Application.logContext2
        );

        instanceIds = instanceIds.concat(
          Object.keys(Application.getRunningInstances())
        );
      }

      instanceIds = HelperList.unique(
        instanceIds.filter(
          instanceId => instanceId !== Definition.ARGUMENT_VALUE_FOR_ALL
        )
      );

      if (instanceIds.length > 0) {
        const affectedCount = await MessageRouter.factoryAndSend(
          this.executionMode,
          this.parameters.applicationInstanceIdentifier,
          instanceIds
        );

        Logger.post(
          'Total instances affected: {affectedCount}',
          { affectedCount },
          LogLevel.Debug,
          Application.logContext2
        );
      } else {
        Logger.post(
          'No instances have been found to be affected.',
          undefined,
          LogLevel.Information,
          Application.logContext2
        );
      }
    }
  }

  /**
   * Para a execução da aplicação.
   * @param errors Erros durante a execução.
   */
  private async stop(...errors: unknown[]): Promise<void> {
    if (this.aplicationState !== 'running') {
      return;
    }
    this.aplicationState = 'stoping';

    try {
      this.deleteRunningFlagFile();
    } catch (error) {
      errors.push(error);
    }

    try {
      await this.onStop();
    } catch (error) {
      errors.push(error);
    }

    errors.push(...(await this.dispose(errors)));

    if (errors.length === 0) {
      Logger.post(
        'The application ended successfully.',
        undefined,
        LogLevel.Debug,
        Application.logContext2
      );
    } else {
      Logger.post(
        'The application ended with {count} error(s).',
        { count: errors.length },
        LogLevel.Error,
        Application.logContext2
      );

      for (const error of errors) {
        Logger.post(
          HelperText.formatError(error),
          {
            error: HelperObject.toText(error)
          },
          LogLevel.Fatal,
          Application.logContext2
        );
      }
    }

    this.aplicationState = 'stoped';
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
      Application.logContext2
    );

    HelperFileSystem.createRecursive(
      this.parameters.runningFlagFile,
      `
FLAG FILE

This file signals that the application should continue running.
It also serves as a channel for receiving messages.
If this file no longer exists, the application is terminated.

Application
 - Name: ${this.parameters.applicationName} 
 - Instance: ${this.parameters.applicationInstanceIdentifier}
`.trim() +
        os.EOL +
        os.EOL
    );

    this.runningFlagFileMonitoring.start();

    Logger.post(
      'Monitoring every {seconds} seconds for the presence of the application instance execution flag file: {path}',
      {
        seconds: Definition.INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_SECONDS,
        path: this.parameters.runningFlagFile
      },
      LogLevel.Debug,
      Application.logContext2
    );
  }

  /**
   * Apaga o arquivo que sinaliza a execução da instância.
   */
  private deleteRunningFlagFile(): void {
    if (this.runningFlagFileMonitoring.isActive) {
      this.runningFlagFileMonitoring.stop();
      Logger.post(
        'Stopped monitoring for the presence of the application instance execution flag file: {path}',
        {
          seconds: Definition.INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_SECONDS,
          path: this.parameters.runningFlagFile
        },
        LogLevel.Debug,
        Application.logContext2
      );
    }

    if (fs.existsSync(this.parameters.runningFlagFile)) {
      Logger.post(
        'Deleting application instance execution flag file: {path}',
        {
          path: this.parameters.runningFlagFile
        },
        LogLevel.Debug,
        Application.logContext2
      );
      fs.unlinkSync(this.parameters.runningFlagFile);
    }
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
        Application.logContext2
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

      const errors = configuration.errors();
      if (errors.length === 0) {
        this.configurationValue = configuration;

        Logger.post(
          'Application configuration loaded.',
          undefined,
          LogLevel.Debug,
          Application.logContext2
        );

        resolve();
      } else {
        reject(
          new InvalidArgumentError(
            'Invalid JSON for {className} in "{file}" file:\n{errors}'.querystring(
              {
                file: this.parameters.configurationFile,
                className: this.constructor.name,
                errors: errors.map(error => `- ${error}`).join('\n')
              }
            )
          )
        );
      }
    });
  }

  /**
   * Configura o serviço de log.
   */
  private configureLogger(): void {
    this.logger.configure(this.configuration.logger, this.parameters);
    this.logger.defaultValues['applicationInstanceId'] =
      this.parameters.applicationInstanceIdentifier;
    this.logger.defaultValues['applicationName'] =
      this.parameters.applicationName;
    this.logger.defaultValues['applicationVersion'] =
      this.parameters.applicationVersion;
  }

  /**
   * Libera os recursos.
   */
  private async dispose(errors: unknown[]): Promise<unknown[]> {
    if (this.onDispose.size === 0) {
      return [];
    }

    Logger.post(
      'Disposing resources.',
      undefined,
      LogLevel.Debug,
      Application.logContext2
    );

    return (
      await HelperObject.triggerEvent(
        this.onDispose,
        errors.length === 0,
        errors
      )
    ).filter(error => Boolean(error));
  }

  /**
   * Evento ao excluir o arquivo de sinalização de execução.
   */
  private async onDeletedRunningFlagFile(): Promise<void> {
    Logger.post(
      'The execution signal file was deleted: {path}',
      {
        path: this.parameters.runningFlagFile
      },
      LogLevel.Debug,
      Application.logContext2
    );
    await this.stop();
  }

  /**
   * Retorna os ids das instâncias em execução.
   */
  public static getRunningInstances(): Record<string, string> {
    return fs
      .readdirSync(ApplicationParameters.inicialDirectory)
      .map(file => ApplicationParameters.regexRunningFlagFileId.exec(file))
      .reduce<Record<string, string>>((result, regexMatch) => {
        if (regexMatch !== null) {
          result[regexMatch[1]] = regexMatch[0];
        }
        return result;
      }, {});
  }
}

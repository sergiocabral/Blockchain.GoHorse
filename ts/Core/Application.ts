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
  Message,
  ResultEvent
} from '@sergiocabral/helper';
import fs from 'fs';
import { Definition } from '../Definition';
import { IApplication } from './IApplication';
import { ApplicationLogger } from '../Log/ApplicationLogger';
import { ApplicationExecutionMode } from './ApplicationExecutionMode';
import { MessageRouter } from '../BusMessage/MessageRouter';
import * as os from 'os';
import {
  ConfigurationReloaded,
  Instance,
  ReloadConfiguration,
  TerminateApplication
} from '@gohorse/npm-core';
import { Translation } from '@gohorse/npm-i18n';

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
  protected abstract get configurationConstructor(): new (
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
    Logger.defaultLogger = this.logger = new ApplicationLogger(
      () => this.configuration.logger,
      () => this.parameters
    );

    const applicationId = Instance.id;
    const applicationStartupTime = Instance.startupTime;

    Logger.post(
      '"{applicationName}" application instance created with id "{applicationId}".',
      {
        applicationId: applicationId,
        applicationName: this.constructor.name
      },
      LogLevel.Information,
      Application.logContext2
    );

    this.parameters = new ApplicationParameters(
      applicationId,
      applicationStartupTime,
      process.argv
    );

    const applicationFlagFileMonitoringStarted = false;
    this.applicationFlagFileMonitoring = new FileSystemMonitoring(
      this.parameters.flagFile,
      Definition.INTERVAL_BETWEEN_CHECKING_APPLICATION_FLAG_FILE_IN_SECONDS,
      applicationFlagFileMonitoringStarted
    );

    this.applicationFlagFileMessageRouter = new MessageRouter(
      this.applicationFlagFileMonitoring
    );

    this.executionMode = this.parameters.hasArgumentName(
      Definition.COMMAND_LINE_ARGUMENT_STOP
    )
      ? ApplicationExecutionMode.TerminateApplication
      : this.parameters.hasArgumentName(Definition.COMMAND_LINE_ARGUMENT_RELOAD)
      ? ApplicationExecutionMode.ReloadConfiguration
      : ApplicationExecutionMode.StartApplication;

    Message.subscribe(
      TerminateApplication,
      this.handleTerminateApplication.bind(this)
    );
    Message.subscribe(
      ReloadConfiguration,
      this.handleReloadConfiguration.bind(this)
    );
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
  private readonly applicationFlagFileMonitoring: FileSystemMonitoring;

  /**
   * Tratamento de mensagem recebidas pelo arquivo de monitoramento.
   */
  public readonly applicationFlagFileMessageRouter: MessageRouter;

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
      'Application started in mode: {applicationExecutionMode}',
      {
        applicationExecutionMode: this.executionMode
      },
      LogLevel.Debug,
      Application.logContext2
    );

    const goAhead =
      this.executionMode === ApplicationExecutionMode.StartApplication
        ? this.executeThisInstance.bind(this)
        : this.sendMessageToOtherInstances.bind(this);

    try {
      await this.loadConfiguration();
      this.configureLogger();
      await new Translation(() => this.configuration.language).load();

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
    this.createApplicationFlagFile();
    await this.onStart();
  }

  /**
   * Sinaliza que a instância devem ser finalizadas.
   * @private
   */
  private async sendMessageToOtherInstances(): Promise<void> {
    let instanceIds = this.parameters
      .getArgumentValues(Definition.COMMAND_LINE_ARGUMENT_INSTANCE_ID)
      .filter(value => value !== undefined)
      .join(',')
      .split(',')
      .filter(value => value.length > 0)
      .map(value => value.trim());

    if (instanceIds.length === 0) {
      Logger.post(
        `It is necessary to inform the id of the application that will be affected. Use \`${Definition.COMMAND_LINE_ARGUMENT_INSTANCE_ID}=applicationId1,applicationId2,applicationId3\` to specify the applications or \`${Definition.COMMAND_LINE_ARGUMENT_INSTANCE_ID}=${Definition.COMMAND_LINE_VALUE_ALL}\` to affect all.`,
        undefined,
        LogLevel.Error,
        Application.logContext2
      );

      const runingInstances = Application.getRunningInstances();
      const runingIds = Object.keys(runingInstances);
      if (runingIds.length > 0) {
        Logger.post(
          `Applications currently running: {applicationIdList}`,
          {
            applicationIdList: runingIds
          },
          LogLevel.Information,
          Application.logContext2
        );
      } else {
        Logger.post(
          `But there is no application currently running.`,
          undefined,
          LogLevel.Information,
          Application.logContext2
        );
      }
    } else {
      const affectAll = instanceIds.includes(Definition.COMMAND_LINE_VALUE_ALL);

      if (affectAll) {
        Logger.post(
          `Affecting all applications because of ${Definition.COMMAND_LINE_VALUE_ALL}.`,
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
          instanceId => instanceId !== Definition.COMMAND_LINE_VALUE_ALL
        )
      );

      if (instanceIds.length > 0) {
        const affectedCount = await MessageRouter.factoryAndSend(
          this.executionMode,
          this.parameters.id,
          instanceIds
        );

        Logger.post(
          'Total applications affected: {count}',
          { count: affectedCount },
          LogLevel.Debug,
          Application.logContext2
        );
      } else {
        Logger.post(
          'No applications have been found to be affected.',
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
      this.deleteApplicationFlagFile();
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
        '"{applicationName}" application (id "{applicationId}") ended successfully.',
        {
          applicationId: this.parameters.id,
          applicationName: this.constructor.name
        },
        LogLevel.Information,
        Application.logContext2
      );
    } else {
      Logger.post(
        '"{applicationName}" application (id "{applicationId}") ended with {count} error(s).',
        {
          applicationId: this.parameters.id,
          applicationName: this.constructor.name,
          count: errors.length
        },
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
  private createApplicationFlagFile(): void {
    Logger.post(
      'Creating application instance execution flag file: {filePath}',
      {
        filePath: this.parameters.flagFile
      },
      LogLevel.Debug,
      Application.logContext2
    );

    HelperFileSystem.createRecursive(
      this.parameters.flagFile,
      `
FLAG FILE

This file signals that the application should continue running.
It also serves as a channel for receiving messages.
If this file no longer exists, the application is terminated.

Application
 - Name: ${this.parameters.packageName} 
 - Id: ${this.parameters.id}
`.trim() +
        os.EOL +
        os.EOL
    );

    this.applicationFlagFileMonitoring.start();

    Logger.post(
      'Monitoring every {timeSeconds} seconds for the presence of the application instance execution flag file: {filePath}',
      {
        timeSeconds:
          Definition.INTERVAL_BETWEEN_CHECKING_APPLICATION_FLAG_FILE_IN_SECONDS,
        filePath: this.parameters.flagFile
      },
      LogLevel.Debug,
      Application.logContext2
    );
  }

  /**
   * Apaga o arquivo que sinaliza a execução da instância.
   */
  private deleteApplicationFlagFile(): void {
    if (this.applicationFlagFileMonitoring.isActive) {
      this.applicationFlagFileMonitoring.stop();
      Logger.post(
        'Stopped monitoring for the presence of the application instance execution flag file: {filePath}',
        {
          filePath: this.parameters.flagFile
        },
        LogLevel.Debug,
        Application.logContext2
      );
    }

    if (fs.existsSync(this.parameters.flagFile)) {
      Logger.post(
        'Deleting application instance execution flag file: {filePath}',
        {
          filePath: this.parameters.flagFile
        },
        LogLevel.Debug,
        Application.logContext2
      );
      fs.unlinkSync(this.parameters.flagFile);
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
            this.configurationConstructor,
            this.parameters.configurationFile
          )
        : ApplicationConfiguration.createNewFile<TConfiguration>(
            this.configurationConstructor,
            this.parameters.configurationFile
          );

      const errors = configuration.errors();
      if (errors.length === 0) {
        this.configurationValue = configuration;

        Logger.post(
          'Application configuration loaded.',
          undefined,
          LogLevel.Verbose,
          Application.logContext2
        );

        resolve();
      } else {
        reject(
          new InvalidArgumentError(
            'Invalid JSON for "{configurationType}" in "{filePath}" file:\n{errorContent}'.querystring(
              {
                filePath: this.parameters.configurationFile,
                configurationType: this.constructor.name,
                errorContent: errors.map(error => `- ${error}`).join('\n')
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
    this.logger.configure();
    this.logger.defaultValues['applicationInstanceId'] = this.parameters.id;
    this.logger.defaultValues['applicationName'] = this.parameters.packageName;
    this.logger.defaultValues['applicationVersion'] =
      this.parameters.packageVersion;
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
   * Handle: Kill
   */
  private async handleTerminateApplication(): Promise<void> {
    await this.stop();
  }

  /**
   * Handle: ReloadConfiguration
   */
  private async handleReloadConfiguration(): Promise<void> {
    let success = false;
    try {
      await this.loadConfiguration();
      success = true;
    } catch (error) {
      Logger.post(
        'An error occurred while reloading configuration: {error}',
        { error: HelperText.formatError(error) },
        LogLevel.Warning,
        Application.logContext2
      );
    }

    if (success) {
      await new ConfigurationReloaded().sendAsync();
    }
  }

  /**
   * Retorna os ids das instâncias em execução.
   */
  public static getRunningInstances(): Record<string, string> {
    return fs
      .readdirSync(ApplicationParameters.startupDirectory)
      .map(file => ApplicationParameters.regexFlagFileId.exec(file))
      .reduce<Record<string, string>>((result, regexMatch) => {
        if (regexMatch !== null) {
          result[regexMatch[1]] = regexMatch[0];
        }
        return result;
      }, {});
  }
}

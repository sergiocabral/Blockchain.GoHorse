import { ApplicationParameters } from './ApplicationParameters';
import { ApplicationConfiguration } from './Configuration/ApplicationConfiguration';
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
  Message
} from '@sergiocabral/helper';
import fs from 'fs';
import { Definition } from '../Definition';
import { IApplication } from './Type/IApplication';
import { ApplicationExecutionMode } from './Type/ApplicationExecutionMode';
import { ApplicationFlagFileMessageRouter } from './ApplicationFlagFileMessageRouter';
import * as os from 'os';
import {
  ApplicationStarted,
  ApplicationTerminated,
  ConfigurationReloaded,
  Instance,
  ReloadConfiguration,
  TerminateApplication
} from '@gohorse/npm-core';
import { Translation } from '@gohorse/npm-i18n';
import { ApplicationLogger } from './ApplicationLogger';
import { ApplicationDatabase } from './ApplicationDatabase';
import { AplicationState } from './Type/ApplicationState';
import { CoreTemplateString } from '@gohorse/npm-core/js/Template/CoreTemplateString';
import { ApplicationTemplateString } from './ApplicationTemplateString';

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
    this.database = new ApplicationDatabase(
      () => this.configuration.database,
      () => this.parameters,
      Definition.DATABASE_LOGGER_NAME
    );

    this.logger = new ApplicationLogger(
      () => this.configuration.logger,
      () => this.parameters,
      this.database.elasticsearch
    );

    const instanceId = Instance.id;
    const instanceStartupTime = Instance.startupTime;

    Logger.post(
      '"{applicationName}" application instance created with id "{instanceId}".',
      {
        instanceId,
        applicationName: this.constructor.name
      },
      LogLevel.Information,
      Application.logContext2
    );

    this.parameters = new ApplicationParameters(
      this,
      instanceId,
      instanceStartupTime,
      process.argv
    );

    const applicationFlagFileMonitoringStarted = false;
    this.applicationFlagFileMonitoring = new FileSystemMonitoring(
      this.parameters.flagFile,
      Definition.INTERVAL_BETWEEN_CHECKING_APPLICATION_FLAG_FILE_IN_SECONDS,
      applicationFlagFileMonitoringStarted
    );

    this.applicationFlagFileMessageRouter =
      new ApplicationFlagFileMessageRouter(this.applicationFlagFileMonitoring);

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
    return this.aplicationState !== AplicationState.Stoped;
  }

  /**
   * Estado de execução da aplicação.
   */
  private aplicationState: AplicationState = AplicationState.Stoped;

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
  public readonly applicationFlagFileMessageRouter: ApplicationFlagFileMessageRouter;

  /**
   * Gerencia os banco de dados da aplicação.
   */
  protected readonly database: ApplicationDatabase;

  /**
   * Logger da aplicação que gerencia múltiplos loggers.
   */
  protected readonly logger: ApplicationLogger;

  /**
   * Inicia a execução da aplicação.
   */
  public async run(): Promise<void> {
    if (
      this.aplicationState === AplicationState.Running ||
      this.aplicationState === AplicationState.Stoping
    ) {
      throw new InvalidExecutionError('Already started or stoping.');
    }

    this.aplicationState = AplicationState.Running;

    Logger.post(
      'Application started in mode: {applicationExecutionMode}',
      () => ({
        applicationExecutionMode: this.executionMode
      }),
      LogLevel.Information,
      Application.logContext2
    );

    const goAhead =
      this.executionMode === ApplicationExecutionMode.StartApplication
        ? this.executeThisInstance.bind(this)
        : this.sendMessageToOtherInstances.bind(this);

    try {
      this.loadTemplateString();
      await this.loadConfiguration();
      this.logger.configure();
      await new Translation(() => this.configuration.language).load();
      await this.database.open();

      await new ApplicationStarted().sendAsync();

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
        const affectedCount =
          await ApplicationFlagFileMessageRouter.factoryAndSend(
            this.executionMode,
            this.parameters.id,
            instanceIds
          );

        Logger.post(
          'Total applications affected: {count} ({toInstanceIdList})',
          { count: affectedCount, toInstanceIdList: instanceIds },
          LogLevel.Information,
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
    if (this.aplicationState !== AplicationState.Running) {
      return;
    }
    this.aplicationState = AplicationState.Stoping;

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

    try {
      await this.dispose();
    } catch (error) {
      errors.push(error);
    }

    try {
      await this.database.close();
    } catch (error) {
      errors.push(error);
    }

    if (errors.length === 0) {
      Logger.post(
        '"{applicationName}" application (id "{instanceId}") ended successfully.',
        () => ({
          instanceId: this.parameters.id,
          applicationName: this.constructor.name
        }),
        LogLevel.Information,
        Application.logContext2
      );
    } else {
      Logger.post(
        '"{applicationName}" application (id "{instanceId}") ended with {count} error(s).',
        () => ({
          instanceId: this.parameters.id,
          applicationName: this.constructor.name,
          count: errors.length
        }),
        LogLevel.Error,
        Application.logContext2
      );

      for (const error of errors) {
        Logger.post(
          HelperText.formatError(error),
          () => ({
            errorDescription: HelperObject.toText(error),
            error: error
          }),
          LogLevel.Fatal,
          Application.logContext2
        );
      }
    }

    this.aplicationState = AplicationState.Stoped;
  }

  /**
   * Cria um arquivo em disco que sinaliza que esta instância está em execução.
   * A remoção do arquivo resulta na finalização da aplicação.
   */
  private createApplicationFlagFile(): void {
    Logger.post(
      'Creating application instance execution flag file: {filePath}',
      () => ({
        filePath: this.parameters.flagFile
      }),
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
      () => ({
        timeSeconds:
          Definition.INTERVAL_BETWEEN_CHECKING_APPLICATION_FLAG_FILE_IN_SECONDS,
        filePath: this.parameters.flagFile
      }),
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
        () => ({
          filePath: this.parameters.flagFile
        }),
        LogLevel.Debug,
        Application.logContext2
      );
    }

    if (fs.existsSync(this.parameters.flagFile)) {
      Logger.post(
        'Deleting application instance execution flag file: {filePath}',
        () => ({
          filePath: this.parameters.flagFile
        }),
        LogLevel.Debug,
        Application.logContext2
      );
      fs.unlinkSync(this.parameters.flagFile);
    }
  }

  /**
   * Carrega as instâncias para substituição de template string.
   */
  private loadTemplateString(): void {
    void new CoreTemplateString();
    void new ApplicationTemplateString(this.parameters);
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
   * Libera os recursos.
   */
  private async dispose(): Promise<void> {
    Logger.post(
      'Disposing resources.',
      undefined,
      LogLevel.Debug,
      Application.logContext2
    );
    try {
      await new ApplicationTerminated().sendAsync();
      Logger.post(
        'Resources disposed without errors.',
        undefined,
        LogLevel.Verbose,
        Application.logContext2
      );
    } catch (error) {
      Logger.post(
        'An error occurred while releasing resources.: {errorDescription}',
        () => ({
          errorDescription: HelperText.formatError(error),
          error
        }),
        LogLevel.Critical,
        Application.logContext2
      );
      throw error;
    }
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
        'An error occurred while reloading configuration: {errorDescription}',
        () => ({
          errorDescription: HelperText.formatError(error),
          error
        }),
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

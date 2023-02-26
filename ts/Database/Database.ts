import { IDatabase } from './IDatabase';
import { DatabaseConfiguration } from './DatabaseConfiguration';
import {
  ConnectionState,
  HelperText,
  InvalidExecutionError,
  Logger,
  LogLevel,
  Message,
  NotImplementedError
} from '@sergiocabral/helper';
import { ConfigurationReloaded } from '@gohorse/npm-core';
import { Definition } from '../Definition';

/**
 * Classe base para conexão com o banco de dados
 */
export abstract class Database<
  TDatabaseConfiguration extends DatabaseConfiguration
> implements IDatabase
{
  /**
   * Contexto do log.
   */
  private static logContext2 = 'Database';

  /**
   * Construtor.
   * @param getConfiguration Configuração.
   * @param whenConnectionFailsIgnoreAndSetConnectionClosed Em caso de falha na conexão ignorar e definir o estado como conexão fechada.
   */
  public constructor(
    protected readonly getConfiguration: () => TDatabaseConfiguration,
    private readonly whenConnectionFailsIgnoreAndSetConnectionClosed = false
  ) {
    Message.subscribe(
      ConfigurationReloaded,
      this.handleConfigurationReloaded.bind(this)
    );
  }

  /**
   * Estado da conexçao.
   */
  private connectionState: ConnectionState = ConnectionState.Closed;

  /**
   * Última configuração utilizada.
   */
  private lastConfiguration?: TDatabaseConfiguration;

  /**
   * Configuração.
   */
  protected get configuration(): TDatabaseConfiguration {
    if (this.lastConfiguration === undefined) {
      this.lastConfiguration = this.getConfiguration();
    }
    return this.lastConfiguration;
  }

  /**
   * Estado da conexão.
   */
  public get state(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Fecha a conexão.
   */
  public async close(): Promise<void> {
    if (this.connectionState === ConnectionState.Ready) {
      this.connectionState = ConnectionState.Switching;
      Logger.post(
        'Closing database connection of type "{className}".',
        {
          className: this.constructor.name
        },
        LogLevel.Information,
        Database.logContext2
      );
      try {
        await this.closeConnection(this.configuration);
        this.connectionState = ConnectionState.Closed;
        Logger.post(
          'Database connection of type "{className}" closed successfully.',
          {
            className: this.constructor.name
          },
          LogLevel.Verbose,
          Database.logContext2
        );
      } catch (error) {
        await this.connectionFail(error);
      }
    } else {
      throw new InvalidExecutionError('Expected connection state as Ready.');
    }
  }

  /**
   * Abre a conexão.
   */
  public async open(): Promise<void> {
    if (!this.configuration.enabled) {
      Logger.post(
        'The database connection of type "{className}" will not be opened because it is disabled.',
        {
          className: this.constructor.name
        },
        LogLevel.Debug,
        Database.logContext2
      );
      return;
    }
    if (this.connectionState === ConnectionState.Closed) {
      this.connectionState = ConnectionState.Switching;
      Logger.post(
        'Opening database connection of type "{className}".',
        {
          className: this.constructor.name
        },
        LogLevel.Information,
        Database.logContext2
      );
      try {
        await this.openConnection(this.configuration);
        this.connectionState = ConnectionState.Ready;
        Logger.post(
          'Database connection of type "{className}" opened successfully.',
          {
            className: this.constructor.name
          },
          LogLevel.Verbose,
          Database.logContext2
        );
      } catch (error) {
        await this.connectionFail(error);
      }
    } else {
      throw new InvalidExecutionError('Expected connection state as Closed.');
    }
  }

  /**
   * Força a finalização de qualquer conexão aberta e redefine a instância da conexão.
   */
  protected abstract resetConnection(
    configuration: TDatabaseConfiguration
  ): Promise<void> | void;

  /**
   * Fecha a conexão.
   */
  protected abstract closeConnection(
    configuration: TDatabaseConfiguration
  ): Promise<void> | void;

  /**
   * Abre a conexão.
   */
  protected abstract openConnection(
    configuration: TDatabaseConfiguration
  ): Promise<void> | void;

  /**
   * Trata uma falha de conexão.
   */
  private async connectionFail(error: unknown): Promise<void> {
    Logger.post(
      'The connection to the database of type "{className}" had an error: {errorDescription}',
      () => ({
        className: this.constructor.name,
        errorDescription: HelperText.formatError(error),
        error
      }),
      this.whenConnectionFailsIgnoreAndSetConnectionClosed
        ? LogLevel.Error
        : LogLevel.Critical,
      Database.logContext2
    );
    if (this.whenConnectionFailsIgnoreAndSetConnectionClosed) {
      Logger.post(
        'The connection to the database of type "{className}" allows the error to be ignored. The connection will be reset to {connectionState} state.',
        {
          className: this.constructor.name,
          connectionState: ConnectionState[ConnectionState.Closed]
        },
        LogLevel.Information,
        Database.logContext2
      );
      try {
        await this.resetConnection(this.configuration);
        Logger.post(
          'The connection to the database of type "{className}" has been reset to {connectionState} state.',
          {
            className: this.constructor.name,
            connectionState: ConnectionState[ConnectionState.Closed]
          },
          LogLevel.Verbose,
          Database.logContext2
        );
      } catch (error) {
        Logger.post(
          'When trying to reset the connection to the database of type "{className}" an error occurred: {errorDescription}',
          () => ({
            className: this.constructor.name,
            errorDescription: HelperText.formatError(error),
            error
          }),
          LogLevel.Critical,
          Database.logContext2
        );
      }
      this.connectionState = ConnectionState.Closed;
    } else {
      throw error;
    }
  }

  /**
   * Timeout para nova tentativa de carregamento por causa de ConnectionState.Switching
   */
  private handleConfigurationReloadedTimeout?: NodeJS.Timeout;

  /**
   * Handle: ConfigurationReloaded
   */
  private async handleConfigurationReloaded(): Promise<void> {
    const configuration = this.getConfiguration();

    if (
      this.handleConfigurationReloadedTimeout === undefined &&
      this.lastConfiguration !== undefined &&
      JSON.stringify(this.lastConfiguration) === JSON.stringify(configuration)
    ) {
      Logger.post(
        'Although the configuration have been reloaded, the connection data to the database of type "{className}" has not changed. Nothing will be done.',
        {
          className: this.constructor.name
        },
        LogLevel.Verbose,
        Database.logContext2
      );
      return;
    }

    clearTimeout(this.handleConfigurationReloadedTimeout);
    this.handleConfigurationReloadedTimeout = undefined;

    this.lastConfiguration = configuration;

    switch (this.state) {
      case ConnectionState.Closed:
        Logger.post(
          'Although the configuration have been reloaded and modified, the connection to the database of type "{className}" is closed. Nothing will be done.',
          {
            className: this.constructor.name
          },
          LogLevel.Verbose,
          Database.logContext2
        );
        return;
      case ConnectionState.Switching:
        Logger.post(
          'Although the configuration have been reloaded and modified, the database connection of type "{className}" is performing a state change. It will wait {timeMilliSeconds} milliseconds for a next check.',
          {
            className: this.constructor.name,
            timeMilliSeconds:
              Definition.TIME_TO_RECHECK_CONNECTION_STATUS_IN_MILLISECONDS
          },
          LogLevel.Verbose,
          Database.logContext2
        );
        this.handleConfigurationReloadedTimeout = setTimeout(
          () => void this.handleConfigurationReloaded(),
          Definition.TIME_TO_RECHECK_CONNECTION_STATUS_IN_MILLISECONDS
        );
        break;
      case ConnectionState.Ready:
        Logger.post(
          'The configuration have been reloaded and modified and the connection to the database of type "{className}" will be restarted.',
          {
            className: this.constructor.name
          },
          LogLevel.Information,
          Database.logContext2
        );
        await this.close();
        await this.open();
        break;
      default:
        throw new NotImplementedError('Invalid connection state.');
    }
  }
}

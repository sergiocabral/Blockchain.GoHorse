import { IDatabase } from './IDatabase';
import { DatabaseConfiguration } from './DatabaseConfiguration';
import {
  ConnectionState,
  InvalidExecutionError,
  Message,
  NotImplementedError
} from '@sergiocabral/helper';
import { ConfigurationReloaded } from '@gohorse/npm-core';
import { Definition } from './Definition';

/**
 * Classe base para conexão com o banco de dados
 */
export abstract class Database<
  TDatabaseConfiguration extends DatabaseConfiguration
> implements IDatabase
{
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
      try {
        await this.closeConnection(this.configuration);
        this.connectionState = ConnectionState.Closed;
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
    if (this.connectionState === ConnectionState.Closed) {
      this.connectionState = ConnectionState.Switching;
      try {
        await this.openConnection(this.configuration);
        this.connectionState = ConnectionState.Ready;
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
    if (this.whenConnectionFailsIgnoreAndSetConnectionClosed) {
      try {
        await this.resetConnection(this.configuration);
      } catch (error) {
        // Não devia acontecer esse erro.
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
      return;
    }

    clearTimeout(this.handleConfigurationReloadedTimeout);
    this.handleConfigurationReloadedTimeout = undefined;

    this.lastConfiguration = configuration;

    switch (this.state) {
      case ConnectionState.Closed:
        return;
      case ConnectionState.Switching:
        this.handleConfigurationReloadedTimeout = setTimeout(
          () => void this.handleConfigurationReloaded(),
          Definition.TIME_TO_RECHECK_CONNECTION_STATUS_IN_MILLISECONDS
        );
        break;
      case ConnectionState.Ready:
        await this.close();
        await this.open();
        break;
      default:
        throw new NotImplementedError('Invalid connection state.');
    }
  }
}

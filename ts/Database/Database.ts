import { IDatabase } from './IDatabase';
import { ConnectionState } from '@sergiocabral/helper/js/Type/Connection/ConnectionState';
import { DatabaseConfiguration } from './DatabaseConfiguration';
import { Message } from '@sergiocabral/helper';
import { ConfigurationReloaded } from '@gohorse/npm-core';

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
   */
  public constructor(
    protected readonly getConfiguration: () => TDatabaseConfiguration
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
   * Estado da conexão.
   */
  public get state(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Fecha a conexão.
   */
  public close(): void {
    // TODO: Implementar close.
  }

  /**
   * Abre a conexão.
   */
  public open(): void {
    // TODO: Implementar open.
  }

  /**
   * Configura a conexão
   */
  public abstract configureConnection(
    configuration: TDatabaseConfiguration
  ): Promise<void> | void;

  /**
   * Handle: ConfigurationReloaded
   */
  private async handleConfigurationReloaded(): Promise<void> {
    await this.configureConnection(this.getConfiguration());
  }
}

import { IDatabase } from './IDatabase';
import { ConnectionState } from '@sergiocabral/helper/js/Type/Connection/ConnectionState';

/**
 * Classe base para conexão com o banco de dados
 */
export abstract class Database implements IDatabase {
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
}

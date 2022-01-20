import { ConnectionState, IConnection } from '@gohorse/npm-core';
import { HelperObject } from '@sergiocabral/helper';

/**
 * Operações comuns para o cliente e servidor WebSocket.
 */
export abstract class WebSocketBase implements IConnection {
  /**
   * Estado da conexão.
   */
  public abstract get state(): ConnectionState;

  /**
   * Fecha a conexão.
   */
  public abstract close(): Promise<void>;

  /**
   * Abre a conexão.
   */
  public abstract open(): Promise<void>;

  /**
   * promise
   */
  protected async eventPromise(
    action: (
      resolve: () => void,
      reject: (rejectAction?: () => void) => void,
      pushError: (error: Error) => void
    ) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let resolved = false;
      let lastError: Error | undefined;

      action(
        () => {
          if (resolved) {
            return;
          }
          resolved = true;
          resolve();
        },
        (rejectAction?: () => void) => {
          if (resolved) {
            return;
          }
          if (rejectAction && HelperObject.isFunction(rejectAction)) {
            rejectAction();
          }
          resolved = true;
          reject(lastError);
        },
        (error: Error) => {
          if (resolved) {
            return;
          }
          if (lastError) {
            HelperObject.setProperty(error, 'innerError', lastError);
          }
          lastError = error;
        }
      );
    });
  }
}

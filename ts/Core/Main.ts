import { Application } from './Application';
import {
  HelperObject,
  InvalidExecutionError,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import { ApplicationConstructor } from './ApplicationConstructor';

/**
 * Módulo principal do programa.
 */
export class Main {
  /**
   * Contexto do log.
   */
  private static logContext = 'Main';

  /**
   * Construtor.
   * @param applicationConstructor Aplicação a ser inciada.
   */
  public constructor(applicationConstructor: ApplicationConstructor) {
    Logger.post(
      'Main module created.',
      undefined,
      LogLevel.Debug,
      Main.logContext
    );

    this.applicationValue = new applicationConstructor(
      (error: unknown | undefined) => {
        if (error === undefined) {
          Logger.post(
            'The application ended successfully.',
            undefined,
            LogLevel.Debug,
            Main.logContext
          );
        } else {
          Logger.post(
            'The application ended with errors.',
            undefined,
            LogLevel.Error,
            Main.logContext
          );
          Logger.post(
            error instanceof Error ? error.message : String(error),
            {
              error: HelperObject.toText(error)
            },
            LogLevel.Fatal,
            Main.logContext
          );
        }
      }
    );
  }

  /**
   * Classe concreta da aplicação.
   */
  private readonly applicationValue?: Application;

  /**
   * Classe concreta da aplicação.
   */
  public get application(): Application {
    if (this.applicationValue === undefined) {
      throw new InvalidExecutionError('Application instance was not created.');
    }
    return this.applicationValue;
  }
}

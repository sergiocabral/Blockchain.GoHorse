import { HelperObject, Logger, LogLevel } from '@sergiocabral/helper';
import { IApplication } from './IApplication';

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
  public constructor(applicationConstructor: new () => IApplication) {
    Logger.post(
      'Main module created.',
      undefined,
      LogLevel.Debug,
      Main.logContext
    );

    const application = new applicationConstructor();
    application.onDispose.add(this.onApplicationDispose.bind(this));
    void application.run();
  }

  /**
   * Evento ao finalizar a aplicação e liberar recursos.
   * @param success Sinalização de sucesso
   * @param error Instância do erro.
   */
  private onApplicationDispose(success: boolean, error?: unknown): void {
    if (success) {
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
        error instanceof Error
          ? error.message
          : error
          ? String(error)
          : 'Unknown error.',
        {
          error: HelperObject.toText(error)
        },
        LogLevel.Fatal,
        Main.logContext
      );
    }
  }
}

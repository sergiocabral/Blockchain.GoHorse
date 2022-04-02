import { Application } from './Application';
import { Logger, LogLevel } from '@sergiocabral/helper';

/**
 * Módulo principal do programa.
 */
export class Main {
  /**
   * Contexto do log nesta classe.
   */
  private static logSection = 'Main';

  /**
   * Construtor.
   * @param applicationConstructor Aplicação a ser inciada.
   */
  public constructor(applicationConstructor: new () => Application) {
    Logger.post(
      'Main module created.',
      undefined,
      LogLevel.Debug,
      Main.logSection
    );

    this.application = new applicationConstructor();
  }

  /**
   * Classe concreta da aplicação.
   */
  public readonly application: Application;
}

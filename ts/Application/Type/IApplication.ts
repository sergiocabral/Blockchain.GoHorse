import { ResultEvent } from '@sergiocabral/helper';
import { ApplicationConfiguration } from '../Configuration/ApplicationConfiguration';
import { ApplicationParameters } from '../ApplicationParameters';

/**
 * Representa uma aplicação executável.
 */
export interface IApplication {
  /**
   * Configurações JSON da aplicação.
   */
  get configuration(): ApplicationConfiguration;

  /**
   * Parâmetros de execução da aplicação.
   */
  get parameters(): ApplicationParameters;

  /**
   * Evento ao finalizar a aplicação e liberar recursos.
   */
  get onDispose(): Set<ResultEvent>;

  /**
   * Sinaliza se a aplicação está em execução.
   */
  get isRunning(): boolean;

  /**
   * Inicia a execução da aplicação.
   */
  run(): void | Promise<void>;
}

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
   * Sinaliza se a aplicação está em execução.
   */
  get isRunning(): boolean;

  /**
   * Inicia a execução da aplicação.
   */
  run(): void | Promise<void>;
}

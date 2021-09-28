/**
 * Representa uma aplicação.
 */
export interface IApplication {
  /**
   * Executa a aplicação.
   */
  run(): void;

  /**
   * Finaliza a aplicação.
   */
  stop(): void;
}

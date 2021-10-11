/**
 * Representa uma aplicação.
 */
export interface IApplication {
  /**
   * Executa a aplicação.
   */
  run(): Promise<void>;

  /**
   * Finaliza a aplicação.
   */
  stop(): Promise<void>;
}

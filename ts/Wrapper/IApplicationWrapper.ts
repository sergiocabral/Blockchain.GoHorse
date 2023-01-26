/**
 * Wrapper para execução de uma aplicação.
 */
export interface IApplicationWrapper {
  /**
   * Executa a aplicação.
   */
  run(): Promise<void>;
}

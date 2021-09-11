/**
 * Representa uma aplicação.
 */
export interface IApplication {
  /**
   * Nome da aplicação.
   */
  get name(): string;

  /**
   * Executa a aplicação.
   */
  run(): void;
}

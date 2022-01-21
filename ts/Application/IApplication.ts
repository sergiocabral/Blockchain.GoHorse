/**
 * Representa uma aplicação.
 */
export interface IApplication {
  /**
   * Evento quando a aplicação for finalizada.
   */
  get onStop(): Set<(() => void) | (() => Promise<void>)>;

  /**
   * Executa a aplicação.
   */
  run(): Promise<void>;

  /**
   * Finaliza a aplicação.
   */
  stop(): Promise<void>;
}

/**
 * Modos de execução da aplicação.
 */
export enum ApplicationExecutionMode {
  /**
   * Início normal da aplicação.
   */
  StartApplication = 'start application',

  /**
   * Finaliza outras aplicações.
   */
  TerminateApplication = 'terminate other applications',

  /**
   * Recarrega configuração das outras aplicações.
   */
  ReloadConfiguration = 'reload configuration of other applications'
}

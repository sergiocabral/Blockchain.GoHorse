/**
 * Modos de execução da aplicação.
 */
export enum ApplicationExecutionMode {
  /**
   * Início normal da instância.
   */
  StartMe = 'start instance',

  /**
   * Finaliza outras instâncias.
   */
  KillApplication = 'kill other instances',

  /**
   * Recarrega configuração das outras instâncias.
   */
  ReloadConfiguration = 'reload configuration of other instances'
}

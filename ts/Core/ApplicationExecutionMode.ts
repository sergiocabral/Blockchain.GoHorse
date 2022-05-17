/**
 * Modos de execução da aplicação.
 */
export enum ApplicationExecutionMode {
  /**
   * Início normal da instância.
   */
  Start = 'start instance',

  /**
   * Finaliza outras instâncias.
   */
  Kill = 'kill other instances',

  /**
   * Recarrega configuração das outras instâncias.
   */
  ReloadConfiguration = 'reload configuration of other instances'
}

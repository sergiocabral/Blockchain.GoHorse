/**
 * Resultados possíveis de uma solicitação de bloqueio.
 */
export enum LockResult {
  /**
   * Esperando.
   */
  Waiting = "Waiting",

  /**
   * Não consegui.
   */
  Cannot = "Cannot",

  /**
   * Conseguiu o bloqueio.
   */
  Locked = "Locked",

  /**
   * O tempo espirou.
   */
  Timeout = "Timeout",
}

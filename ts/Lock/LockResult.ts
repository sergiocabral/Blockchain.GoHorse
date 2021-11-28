/**
 * Resultados possíveis de uma solicitação de bloqueio.
 */
export enum LockResult {
  /**
   * Estado inicial.
   */
  None = "None",

  /**
   * Esperando resposta.
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
   * Liberado.
   */
  Released = "Released",

  /**
   * O tempo espirou.
   */
  Timeout = "Timeout",

  /**
   * Falha.
   */
  Fail = "Fail",
}

/**
 * Conjunto de parâmetro de definição de baixo nível.
 */
export class Definition {
  /**
   * Espera limite para conseguir o bloqueio.
   */
  public static readonly LOCK_TIMEOUT_ACQUIRE_IN_SECONDS = 30;

  /**
   * Espera de espera antes de liberar.
   */
  public static readonly LOCK_TIMEOUT_RELEASE_IN_SECONDS = 10;

  /**
   * Constante de 1 segundo como milissegundos.
   */
  public static readonly ONE_SECOND_IN_MILLISECOND = 1000;
}

/**
 * Conjunto de parâmetro de definição de baixo nível.
 */
export class Definition {
  /**
   * Nome do idioma padrão.
   */
  public static readonly DEFAULT_LANGUAGE = "en-US";

  /**
   * Intervalo entre verificação de arquivos em disco usados como sinalizadores.
   */
  public static readonly INTERVAL_BETWEEN_CHECKING_FLAG_FILE = 10000;

  /**
   * Espera limite para conseguir o bloqueio.
   */
  public static readonly LOCK_TIMEOUT_ACQUIRE = 30000;

  /**
   * Espera de espera antes de liberar.
   */
  public static readonly LOCK_TIMEOUT_RELEASE = 10000;
}

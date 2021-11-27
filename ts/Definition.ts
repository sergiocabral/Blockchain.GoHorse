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
   * Tempo de esperar por um bloqueio de sincronização do Bus.
   */
  public static readonly LOCK_TIMEOUT = 10000;
}

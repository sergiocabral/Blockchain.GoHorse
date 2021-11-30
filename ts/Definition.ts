/**
 * Conjunto de parâmetro de definição de baixo nível.
 */
export class Definition {
  /**
   * Intervalo padrão (quando não especificado) entre cada PING ao servidor para indicar conexão ativa.
   */
  public static readonly DEFAULT_INTERVAL_BETWEEN_PING_TO_SERVER_IN_SECONDS = 60;

  /**
   * Nome do idioma padrão.
   */
  public static readonly DEFAULT_LANGUAGE = "en-US";

  /**
   * Intervalo entre verificação de arquivos em disco usados como sinalizadores.
   */
  public static readonly INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_MILLISECONDS = 10000;

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

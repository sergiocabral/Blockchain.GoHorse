/**
 * Conjunto de parâmetro de definição de baixo nível.
 */
export class Definition {
  /**
   * Intervalo padrão (quando não especificado) entre cada PING ao servidor para indicar conexão ativa.
   */
  public static readonly DEFAULT_INTERVAL_BETWEEN_PING_TO_SERVER_IN_SECONDS = 60;

  /**
   * Intervalo entre verificações para saber se é para finalizar a aplicação.
   */
  public static readonly INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_MILLISECONDS = 5000;

  /**
   * Constante de 1 segundo como milissegundos.
   */
  public static readonly ONE_SECOND_IN_MILLISECOND = 1000;
}

/**
 * Definições hard-coded.
 */
export class Definition {
  /**
   * Intervalo entre verificações para saber se é para finalizar a aplicação.
   */
  public static readonly INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_SECONDS = 5;

  /**
   * Parâmetro recebido pela linha de comando que entra no modo de finalizar outras instâncias.
   */
  public static readonly ARGUMENT_STOP = '/stop';

  /**
   * Parâmetro recebido pela linha de comando que entra no modo de recarregar configurações.
   */
  public static readonly ARGUMENT_RELOAD = '/reload';

  /**
   * Parâmetro recebido pela linha de comando com valores de ids de instâncias.
   */
  public static readonly ARGUMENT_INSTANCE_ID = '/id';

  /**
   * Valor de argumento usado para sinalizar 'todos'.
   */
  public static readonly ARGUMENT_VALUE_FOR_ALL = '*';

  /**
   * Prefixo dos arquivos de ambiente.
   */
  public static readonly ENVIRONMENT_FILE_PREFIX = 'env';

  /**
   * Sufixo dos arquivos de finalização de execução.
   */
  public static readonly RUNNING_FILE_SUFFIX = 'isRunning';

  /**
   * Tolerancia de atrasado em segundos para ler mensagens do arquivo de sinalização.
   */
  public static readonly DELAY_TOLERANCE_IN_SECONDS_FOR_READING_MESSAGES = 10;
}

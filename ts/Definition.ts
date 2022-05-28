/**
 * Definições hard-coded.
 */
export class Definition {
  /**
   * Prefixo dos arquivos de ambiente.
   */
  public static readonly ENVIRONMENT_FILE_PREFIX = 'env';

  /**
   * Sufixo dos arquivos de sinalização da aplicação.
   */
  public static readonly APPLICATION_FLAG_FILE_SUFFIX = 'isRunning';

  /**
   * Parâmetro de linha de comando.
   * Sinaliza que a aplicação será iniciada no modo que finaliza outras instâncias de aplicação em execução.
   */
  public static readonly COMMAND_LINE_ARGUMENT_STOP = '/stop';

  /**
   * Parâmetro de linha de comando.
   * Sinaliza que a aplicação será iniciada no modo que notifica outras instâncias de aplicação para recarregarem suas configurações.
   */
  public static readonly COMMAND_LINE_ARGUMENT_RELOAD = '/reload';

  /**
   * Parâmetro de linha de comando.
   * Recebe os valores dos ids das aplicações que serão afetadas.
   * Usado em conjunto com os parâmetros /stop ou /reload
   */
  public static readonly COMMAND_LINE_ARGUMENT_INSTANCE_ID = '/id';

  /**
   * Valor para parâmetros de linha de comando.
   * Usado para representar 'todos' num dado contexto.
   * Por exemplo, todas as aplicações em execução nos parâmetros /stop ou /reload
   */
  public static readonly COMMAND_LINE_VALUE_ALL = '*';

  /**
   * Intervalo (em segundos) entre as verificações do arquivo de sinalização para a aplicação.
   * Através deste arquivo são recebidas mensagens de comunicação entre instãncias de aplicação.
   * Por exemplo, finalizar ou recarregar o arquivo JSON de configuração.
   */
  public static readonly INTERVAL_BETWEEN_CHECKING_APPLICATION_FLAG_FILE_IN_SECONDS = 5;

  /**
   * Tolerancia de atraso (em segundos) para ler mensagens do arquivo de sinalização.
   * Contando do momento atual menos o tempo especificado as mensagens serão lidas.
   * Mensagens com data mais antigas que isso, mesmo que postadas recentemente, serão ignoradas.
   */
  public static readonly DELAY_TOLERANCE_FOR_READING_MESSAGES_IN_SECONDS = 10;
}

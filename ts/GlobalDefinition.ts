/**
 * Definições globais hard-coded.
 */
export class GlobalDefinition {
  /**
   * Tempo de 1 segundo em milesegundos.
   */
  public static readonly TIME_OF_ONE_SECOND_IN_MILLISECONDS = 1000;

  /**
   * Tempo de 1 minuto em milesegundos.
   */
  public static readonly TIME_OF_ONE_MINUTE_IN_MILLISECONDS =
    GlobalDefinition.TIME_OF_ONE_SECOND_IN_MILLISECONDS * 60;

  /**
   * Tempo de 1 hora em milesegundos.
   */
  public static readonly TIME_OF_ONE_HOUR_IN_MILLISECONDS =
    GlobalDefinition.TIME_OF_ONE_MINUTE_IN_MILLISECONDS * 60;

  /**
   * Tempo de 1 dia em milesegundos.
   */
  public static readonly TIME_OF_ONE_DAY_IN_MILLISECONDS =
    GlobalDefinition.TIME_OF_ONE_HOUR_IN_MILLISECONDS * 24;

  /**
   * Prefixo dos arquivos de ambiente.
   */
  public static readonly ENVIRONMENT_FILE_PREFIX = 'env';

  /**
   * Nome padrão do diretório node_modules do NodeJS.
   */
  public static readonly DIRECTORY_NAME_FOR_NODE_MODULES = 'node_modules';

  /**
   * Nome padrão do diretório dos pacotes @gohorse.
   */
  public static readonly DIRECTORY_NAME_FOR_GOHORSE = '@gohorse';

  /**
   * Domínio de internet relacionado aos pacotes gohorse.
   */
  public static readonly INTERNET_DOMAIN_FOR_GOHORSE = 'gohorse.dev';

  /**
   * Password padrão gravado em hard-coded para qualquer serviço.
   */
  public static readonly WELL_KNOWN_PASSWORD =
    'nMr889$&6Qp!fiQmfs3TxXzCqBkbFBeCH5YftG5d2TddPRUrEXsp$@vB#4cEGiJaF&77z%9!xtmnC#6FTY^zp@BNuDwDiZF#bfxGAF$NML!8SyACKHx$YnTM^Yf3$ifN';
}

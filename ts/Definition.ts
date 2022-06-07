/**
 * Definições hard-coded.
 */
export class Definition {
  /**
   * Comprimento padrão dos ids gerados com Generate.id();
   * Esses ids são usados pelos vários do sistema.
   */
  public static readonly GENERATE_ID_DEFAULT_LENGTH = 5;

  /**
   * Lista unificada para todos os pacotes contendo nomes de variáveis usadas em template de texto.
   */
  public static TEMPLATE_STRING_VARIABLES = {
    /**
     * Data atual.
     */
    DATE: '{date}',

    /**
     * Hora atual.
     */
    TIME: '{time}',

    /**
     * Data e hora atual.
     */
    DATETIME: '{datetime}',

    /**
     * Id da instância em execução.
     */
    INSTANCE_ID: '{instanceId}',

    /**
     * Id da instância em execução.
     */
    INSTANCE_STARTUP_DATE: '{instanceStartupDate}',

    /**
     * Id da instância em execução.
     */
    INSTANCE_STARTUP_TIME: '{instanceStartupTime}',

    /**
     * Id da instância em execução.
     */
    INSTANCE_STARTUP_DATETIME: '{instanceStartupDatetime}',

    /**
     * Nome do pacote NPM em execução.
     */
    PACKAGE_NAME: '{packageName}',

    /**
     * Versão do pacote NPM em execução.
     */
    PACKAGE_VERSION: '{packageVersion}',

    /**
     * Nome da aplicação em execução.
     */
    APPLICATION_NAME: '{applicationName}'
  };
}

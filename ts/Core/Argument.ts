/**
 * Responde perguntas sobre quais parâmetros foram informados na linha de comando.
 */
export class Argument {
  /**
   * Nome da aplicação a ser executada.
   */
  public static getApplicationName(): string {
    return Argument.getArgumentValue(/Application$/);
  }

  /**
   * Nome (caminho) do arquivo de configurações da aplicação.
   */
  public static getEnvironmentFile(): string {
    return Argument.getArgumentValue(/\.json$/);
  }

  /**
   * Nome (caminho) do arquivo de configurações da aplicação.
   */
  public static hasStopArgument(): boolean {
    return Boolean(Argument.getArgumentValue(/^--stop$/));
  }

  /**
   * Retorna o valor de um argumento.
   * @param regex Retorna o valor que passar no teste da regex.
   */
  private static getArgumentValue(regex: RegExp): string {
    return process.argv.find((arg) => regex.test(arg)) ?? "";
  }
}

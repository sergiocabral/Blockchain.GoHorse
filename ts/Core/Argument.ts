import fs from "fs";
import path from "path";

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
   * Nome da aplicação a ser executada.
   */
  public static getExecutableFile(): string {
    return process.argv[1];
  }

  /**
   * Nome da aplicação a ser executada.
   */
  public static getRootDirectory(): string {
    return fs.realpathSync(
      path.resolve(path.dirname(Argument.getExecutableFile()), "..")
    );
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

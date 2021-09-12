/**
 * Responde perguntas sobre quais parâmetros foram informados na linha de comando.
 */
export class Argument {
  /**
   * Nome da aplicação a ser executada.
   */
  public static getApplicationName(): string {
    const argumentIndexForApplicationName = 2;

    return Argument.getArgumentIndex(argumentIndexForApplicationName);
  }

  /**
   * Nome (caminho) do arquivo de configurações da aplicação.
   */
  public static getEnvironmentFile(): string {
    const argumentIndexForEnvironmentFile = 3;

    return Argument.getArgumentIndex(argumentIndexForEnvironmentFile);
  }

  /**
   * Retorna o o valor de um argumento.
   * @param index Posição do parâmetro.
   */
  private static getArgumentIndex(index: number): string {
    return (process.argv[index] ?? "").trim();
  }
}

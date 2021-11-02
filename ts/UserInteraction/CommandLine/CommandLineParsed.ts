/**
 * Representa um comando de linha.
 */
export class CommandLineParsed {
  /**
   * Determina se um nome de argumento corresponde a um argumento informado.
   * @param argumentName Nome do argumento
   * @param arg Argumento informado na linha de comando.
   */
  private static matchArgument(argumentName: string, arg: string): boolean {
    const argLower = arg.toLowerCase();
    const argumentNameLower = argumentName.toLowerCase();

    return (
      (argumentName.length === 1 && argLower === `-${argumentNameLower}`) ||
      (argumentName.length > 1 && argLower === `--${argumentNameLower}`)
    );
  }

  /**
   * ConstructorConstrutor.
   * @param command Comando.
   * @param args Argumentos.
   */
  public constructor(
    public readonly command: string,
    public readonly args: string[]
  ) {}

  /**
   * Retorna o valor de um argumento
   */
  public getArgumentValue(argumentName: string): string | undefined {
    const argIndex = this.args.findIndex((arg) =>
      CommandLineParsed.matchArgument(argumentName, arg)
    );

    return argIndex < 0 ? undefined : this.args[argIndex + 1];
  }

  /**
   * Determina se um argumento foi infomado.
   */
  public hasArgumentName(argumentName: string): boolean {
    return (
      this.args.find((arg) =>
        CommandLineParsed.matchArgument(argumentName, arg)
      ) !== undefined
    );
  }

  /**
   * Determina se um argumento foi infomado.
   */
  public hasArgumentValue(
    argumentName: string,
    argumentValue: string
  ): boolean {
    return this.getArgumentValue(argumentName) === argumentValue;
  }

  /**
   * Responde se a instância corresponde ao comando infromado.
   */
  public isCommand(commandName: string): boolean {
    return commandName.toLowerCase() === this.command.toLowerCase();
  }
}

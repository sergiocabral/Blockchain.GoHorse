import { CommandLineParsed } from "./CommandLineParsed";

/**
 * Faz o parse da linha de comando.
 */
export class CommandLineParser {
  /**
   * Avalia um comando de linha.
   */
  public static parse(commandLine: string): CommandLineParsed | undefined {
    const name = CommandLineParser.getCommandName(commandLine);
    const args = CommandLineParser.getCommandArguments(commandLine);

    return name !== undefined && args !== undefined
      ? new CommandLineParsed(name, args)
      : undefined;
  }

  /**
   * Extrai os argumentos da linha de comando.
   */
  private static getCommandArguments(commandLine: string) {
    // TODO: fazer parse dos argumentos.

    return [];
  }

  /**
   * Extrai o nome do linha de comando.
   */
  private static getCommandName(commandLine: string): string | undefined {
    const regexCommandName = /^\s*[^\s]+\s*/;

    return (regexCommandName.exec(commandLine) ?? [])[0];
  }
}

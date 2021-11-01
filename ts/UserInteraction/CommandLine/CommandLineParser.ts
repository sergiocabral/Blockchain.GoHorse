import { CommandLineParsed } from "./CommandLineParsed";

/**
 * Faz o parse da linha de comando.
 */
export class CommandLineParser {
  /**
   * Avalia um comando de linha.
   */
  public static parse(commandLine: string): CommandLineParsed | undefined {
    const commandName = CommandLineParser.getCommandName(commandLine);

    // TODO: fazer o parse de fato.
    return commandName ? new CommandLineParsed(commandName) : undefined;
  }

  /**
   * Extrai o nome do comando.
   */
  private static getCommandName(commandLine: string): string | undefined {
    const regexCommandName = /^\s*[^\s]+\s*/;

    return (regexCommandName.exec(commandLine) ?? [])[0];
  }
}

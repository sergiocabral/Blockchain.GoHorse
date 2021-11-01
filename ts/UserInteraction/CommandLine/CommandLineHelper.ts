import { CommandLineParsed } from "./CommandLineParsed";

/**
 * Faz o parse da linha de comando.
 */
export class CommandLineHelper {
  /**
   * Avalia um comando de linha.
   */
  public static parse(commandLine: string): CommandLineParsed {
    // TODO: fazer o parse de fato.
    return new CommandLineParsed(commandLine);
  }
}

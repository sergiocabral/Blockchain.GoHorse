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

    return name !== undefined ? new CommandLineParsed(name, args) : undefined;
  }

  /**
   * Extrai os argumentos da linha de comando.
   */
  private static getCommandArguments(commandLine: string) {
    let input = commandLine;
    const regexWhiteSpace = /\s+/;
    const quotes = "\"'`´";
    const regexQuoted = new RegExp(`([${quotes}]).*?\\1`, "g");
    const intoQuotes = input.match(regexQuoted);
    if (intoQuotes) {
      intoQuotes.forEach(
        (match) =>
          (input = input.replace(
            match,
            match.replace(/\s/g, String.fromCharCode(0))
          ))
      );
    }

    return input.split(regexWhiteSpace).map((argument) => {
      const regexIsQuoted = new RegExp(`^([${quotes}]).*\\1$`);
      const isQuoted = regexIsQuoted.test(argument);
      if (isQuoted) {
        const twoQuotesLength = 2;
        argument = argument
          .substr(1, argument.length - twoQuotesLength)
          .replace(/\0/g, " ");
      } else {
        argument = argument.trim();
      }

      return argument;
    });
  }

  /**
   * Extrai o nome do linha de comando.
   */
  private static getCommandName(commandLine: string): string | undefined {
    const regexCommandName = /^\s*[^\s]+\s*/;

    return (regexCommandName.exec(commandLine) ?? [])[0]?.trim();
  }
}

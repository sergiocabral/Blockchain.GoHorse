import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { ExchangeCoinMessage } from "../../Coin/BusMessage/ExchangeCoinMessage";
import { CommandLineParsed } from "../../UserInteraction/CommandLine/CommandLineParsed";
import { ICreateUserCommand } from "../../UserInteraction/ICreateUserCommand";

/**
 * Cria comando de bus a partir da linha de comando do usuário.
 */
export class CreateUserCommand implements ICreateUserCommand {
  /**
   * Comando: exchange
   */
  public static exchange(command: CommandLineParsed): BusMessage | undefined {
    const from = command.getUniqueValueFromAnyArguments("from", "f") ?? "";
    const destination =
      command.getUniqueValueFromAnyArguments("destination", "d") ?? "";
    const price = Number(command.getUniqueValueFromAnyArguments("price", "p"));
    const amount = Number(
      command.getUniqueValueFromAnyArguments("amount", "a")
    );
    const message = command.getUniqueValueFromAnyArguments("message", "m");

    const isValid =
      from.length > 0 && destination.length > 0 && price > 0 && amount > 0;

    return isValid
      ? new ExchangeCoinMessage(from, destination, price, amount, message)
      : undefined;
  }

  /**
   * Cria uma mensagem do Bus a partir de uma linha de comando.
   * @param commandLine Linha de comando.
   */
  public createMessageBus(
    commandLine: CommandLineParsed | undefined
  ): BusMessage | undefined {
    switch (commandLine?.command) {
      case "exchange":
        return CreateUserCommand.exchange(commandLine);
      default:
        return undefined;
    }
  }
}

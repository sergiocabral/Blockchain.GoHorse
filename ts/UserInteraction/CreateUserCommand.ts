import { BusMessage } from "../Bus/BusMessage/BusMessage";
import { ExchangeCoinMessage } from "../Coin/BusMessage/ExchangeCoinMessage";

import { CommandLineParsed } from "./CommandLine/CommandLineParsed";

/**
 * Cria comando de bus a partir da linha de comando do usuário.
 */
export class CreateUserCommand {
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
}

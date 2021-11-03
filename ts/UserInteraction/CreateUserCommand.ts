import { BusMessage } from "../Bus/BusMessage/BusMessage";
import { ExchangeCoinMessage } from "../Coin/Message/ExchangeCoinMessage";

import { CommandLineParsed } from "./CommandLine/CommandLineParsed";

/**
 * Cria comando de bus a partir da linha de comando do usuário.
 */
export class CreateUserCommand {
  /**
   * Comando: exchange
   */
  public static exchange(command: CommandLineParsed): BusMessage | undefined {
    // TODO: Ajustar getArgumentValue para aceitar uma lista de parâmetros (para aceitar não verbose)

    const from = command.getArgumentValue("from") ?? "";
    const destination = command.getArgumentValue("destination") ?? "";
    const price = Number(command.getArgumentValue("price"));
    const amount = Number(command.getArgumentValue("amount"));
    const message = command.getArgumentValue("message");

    const isValid =
      from.length > 0 && destination.length > 0 && price > 0 && amount > 0;

    return isValid
      ? new ExchangeCoinMessage(from, destination, price, amount, message)
      : undefined;
  }
}

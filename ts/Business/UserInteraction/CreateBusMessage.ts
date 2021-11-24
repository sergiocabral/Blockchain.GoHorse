import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { ExchangeCoinMessage } from "../../Coin/BusMessage/ExchangeCoinMessage";
import { CommandLineParsed } from "../../UserInteraction/CommandLine/CommandLineParsed";
import { ICreateBusMessage } from "../../UserInteraction/ICreateBusMessage";

/**
 * Criação de mensagens para o Bus a partir de entradas do usuário.
 */
export class CreateBusMessage implements ICreateBusMessage {
  // TODO: Isso é pra ficar aqui mesmo? Coin? UserInteraction, Business?

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
   * @param userCommand Linha de comando.
   */
  public fromUserCommand(
    userCommand: CommandLineParsed | undefined
  ): BusMessage | undefined {
    switch (userCommand?.command) {
      case "exchange":
        return CreateBusMessage.exchange(userCommand);
      default:
        return undefined;
    }
  }
}

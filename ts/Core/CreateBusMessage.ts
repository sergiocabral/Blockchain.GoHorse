import { BusMessage } from '@gohorse/npm-bus';
import { ExchangeCoinMessage } from '../Temporary/ExchangeCoinMessage';
import { CommandLineParsed } from '../CommandLine/CommandLineParsed';
import { ICreateBusMessage } from './ICreateBusMessage';

/**
 * Criação de mensagens para o Bus a partir de entradas do usuário.
 */
export class CreateBusMessage implements ICreateBusMessage {
  /**
   * Comando: exchange
   */
  public static exchange(command: CommandLineParsed): BusMessage | undefined {
    const from = command.getUniqueValueFromAnyArguments('from', 'f') ?? '';
    const destination =
      command.getUniqueValueFromAnyArguments('destination', 'd') ?? '';
    const price = Number(command.getUniqueValueFromAnyArguments('price', 'p'));
    const amount = Number(
      command.getUniqueValueFromAnyArguments('amount', 'a')
    );
    const message = command.getUniqueValueFromAnyArguments('message', 'm');

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
      case 'exchange':
        return CreateBusMessage.exchange(userCommand);
      default:
        return undefined;
    }
  }
}

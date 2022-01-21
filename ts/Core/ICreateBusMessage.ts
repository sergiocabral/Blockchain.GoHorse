import { BusMessage } from '@gohorse/npm-bus';
import { CommandLineParsed } from '../CommandLine/CommandLineParsed';

/**
 * Criação de mensagens para o Bus a partir de entradas do usuário.
 */
export interface ICreateBusMessage {
  /**
   * Cria uma mensagem do Bus a partir de uma linha de comando.
   * @param userCommand Linha de comando.
   */
  fromUserCommand(
    userCommand: CommandLineParsed | undefined
  ): BusMessage | undefined;
}

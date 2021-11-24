import { BusMessage } from "../Bus/BusMessage/BusMessage";

import { CommandLineParsed } from "./CommandLine/CommandLineParsed";

/**
 * Ações relacionadas a comandos do usuário.
 */
export interface ICreateUserCommand {
  /**
   * Cria uma mensagem do Bus a partir de uma linha de comando.
   * @param commandLine Linha de comando.
   */
  createMessageBus(
    commandLine: CommandLineParsed | undefined
  ): BusMessage | undefined;
}

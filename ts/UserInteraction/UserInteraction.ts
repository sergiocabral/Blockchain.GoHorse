import { Message } from "@sergiocabral/helper";

import { BusClient } from "../Bus/BusClient";
import { BusMessage } from "../Bus/BusMessage/BusMessage";

import { CommandLineParser } from "./CommandLine/CommandLineParser";
import { CreateUserCommand } from "./CreateUserCommand";
import { UserMessageReceived } from "./Message/UserMessageReceived";

/**
 * Interação com o usuário.
 */
export class UserInteraction {
  /**
   * Construtor.
   * @param busClient Cliente de acesso ao Bus
   */
  public constructor(private busClient: BusClient) {
    Message.subscribe(
      UserMessageReceived,
      this.handleUserMessageReceived.bind(this)
    );
  }

  /**
   * Handle: UserMessageReceived
   */
  private handleUserMessageReceived(message: UserMessageReceived): void {
    const commandLineParsed = CommandLineParser.parse(message.message);

    let command: BusMessage | undefined;
    switch (commandLineParsed?.command) {
      case "exchange":
        command = CreateUserCommand.exchange(commandLineParsed);
        break;
      default:
      // TODO: Rejeitar mensagem porque não é válida. Devolver a quem enviou.
    }

    if (command !== undefined) {
      // TODO: Isso aqui ainda não funciona. Erro: Websocket client connection closed with code "4100" and reason "NotImplementedError: Unknown category of message bus.".
      this.busClient.send(command);
    }
  }
}

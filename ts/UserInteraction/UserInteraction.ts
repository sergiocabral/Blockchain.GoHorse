import { Message } from "@sergiocabral/helper";

import { CommandLineParser } from "./CommandLine/CommandLineParser";
import { CreateUserCommand } from "./CreateUserCommand";
import { UserMessageReceived } from "./Message/UserMessageReceived";

/**
 * Interação com o usuário.
 */
export class UserInteraction {
  /**
   * Handle: UserMessageReceived
   */
  private static handleUserMessageReceived(message: UserMessageReceived): void {
    const commandLineParsed = CommandLineParser.parse(message.message);

    switch (commandLineParsed?.command) {
      case "exchange":
        return void CreateUserCommand.exchange(commandLineParsed)?.sendAsync();
      default:
      // TODO: Rejeitar mensagem porque não é válida. Devolver a quem enviou.
    }
  }

  /**
   * Construtor.
   */
  public constructor() {
    Message.subscribe(
      UserMessageReceived,
      UserInteraction.handleUserMessageReceived.bind(this)
    );
  }
}

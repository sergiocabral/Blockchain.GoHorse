import { Message } from "@sergiocabral/helper";

import { ExchangeCoinMessage } from "../Coin/Message/ExchangeCoinMessage";

import { CommandLineParser } from "./CommandLine/CommandLineParser";
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
        // TODO: Repassar os parâmetros do comando.
        new ExchangeCoinMessage("", "", 0, 0, "").sendAsync();
        break;
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

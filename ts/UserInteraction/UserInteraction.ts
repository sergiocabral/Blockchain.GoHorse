import { Message, ShouldNeverHappenError } from "@sergiocabral/helper";

import { BusClient } from "../Bus/BusClient";
import { BusMessage } from "../Bus/BusMessage/BusMessage";

import { CommandRejected } from "./BusMessage/CommandRejected";
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

    let busMessage: BusMessage | undefined;
    switch (commandLineParsed?.command) {
      case "exchange":
        busMessage = CreateUserCommand.exchange(commandLineParsed);
        break;
      default:
        // TODO: Continuar daqui. Falta testar o envio de volta para o emissor.
        busMessage = new CommandRejected(message);
    }

    if (!busMessage) {
      throw new ShouldNeverHappenError();
    }

    this.busClient.send(busMessage);
  }
}

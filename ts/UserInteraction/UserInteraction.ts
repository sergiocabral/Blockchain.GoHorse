import { Message, ShouldNeverHappenError } from "@sergiocabral/helper";

import { BusClient } from "../Bus/BusClient";
import { BusMessage } from "../Bus/BusMessage/BusMessage";

import { UserMessageRejected } from "./BusMessage/UserMessageRejected";
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
  public constructor(private readonly busClient: BusClient) {
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
        busMessage = new UserMessageRejected(message);
    }

    if (!busMessage) {
      throw new ShouldNeverHappenError();
    }

    this.busClient.send(busMessage); // TODO: Desacomplar. Enviar talvez pelo bus interno. sendToBus()
  }
}

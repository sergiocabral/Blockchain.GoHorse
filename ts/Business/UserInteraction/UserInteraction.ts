import { Message, ShouldNeverHappenError } from "@sergiocabral/helper";

import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { SendBusMessage } from "../Bus/Message/SendBusMessage";

import { UserMessageRejected } from "./BusMessage/UserMessageRejected";
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

    void new SendBusMessage(busMessage).sendAsync();
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

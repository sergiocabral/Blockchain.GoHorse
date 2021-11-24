import { Message } from "@sergiocabral/helper";

import { SendBusMessage } from "../Business/Bus/Message/SendBusMessage";

import { UserMessageRejected } from "./BusMessage/UserMessageRejected";
import { CommandLineParser } from "./CommandLine/CommandLineParser";
import { ICreateUserCommand } from "./ICreateUserCommand";
import { UserMessageReceived } from "./Message/UserMessageReceived";

/**
 * Interação com o usuário.
 */
export class UserInteraction {
  /***
   * Construtor.
   * @param userCommand Ações relacionadas a comandos do usuário.
   */
  public constructor(private readonly userCommand: ICreateUserCommand) {
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

    const busMessage =
      this.userCommand.createMessageBus(commandLineParsed) ??
      new UserMessageRejected(message);

    void new SendBusMessage(busMessage).sendAsync();
  }
}

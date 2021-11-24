import { Message } from "@sergiocabral/helper";

import { SendBusMessage } from "../Business/Bus/Message/SendBusMessage";

import { UserMessageRejected } from "./BusMessage/UserMessageRejected";
import { CommandLineParser } from "./CommandLine/CommandLineParser";
import { ICreateBusMessage } from "./ICreateBusMessage";
import { UserMessageReceived } from "./Message/UserMessageReceived";

/**
 * Interação com o usuário.
 */
export class UserInteraction {
  /***
   * Construtor.
   * @param createBusMessage Criação de mensagens para o Bus.
   */
  public constructor(private readonly createBusMessage: ICreateBusMessage) {
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
      this.createBusMessage.fromUserCommand(commandLineParsed) ??
      new UserMessageRejected(message);

    void new SendBusMessage(busMessage).sendAsync();
  }
}

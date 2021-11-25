import { Message } from "@sergiocabral/helper";

import { SendBusMessage } from "../Bus/Message/SendBusMessage";

import { UserMessageRejected } from "./BusMessage/UserMessageRejected";
import { CommandLineParser } from "./CommandLine/CommandLineParser";
import { CreateBusMessage } from "./CreateBusMessage";
import { ICreateBusMessage } from "./ICreateBusMessage";
import { UserMessageReceived } from "./Message/UserMessageReceived";

/**
 * Interação com o usuário.
 */
export class UserInteraction {
  /**
   * Criador de mensagens para o Bus.
   */
  private readonly createBusMessage: ICreateBusMessage;

  /***
   * Construtor.
   * @param createBusMessage Criação de mensagens para o Bus.
   */
  public constructor(createBusMessage?: ICreateBusMessage) {
    this.createBusMessage = createBusMessage ?? new CreateBusMessage();

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

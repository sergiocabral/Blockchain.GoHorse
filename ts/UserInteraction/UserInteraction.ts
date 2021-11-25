import { HashJson, Message } from "@sergiocabral/helper";

import { BusMessageUndelivered } from "../Bus/BusMessage/Communication/BusMessageUndelivered";
import { SendBusMessage } from "../Bus/Message/SendBusMessage";

import { UserMessageRejected } from "./BusMessage/UserMessageRejected";
import { CommandLineParser } from "./CommandLine/CommandLineParser";
import { CreateBusMessage } from "./CreateBusMessage";
import { ICreateBusMessage } from "./ICreateBusMessage";
import { UserMessageReceived } from "./Message/UserMessageReceived";
import { RejectReason } from "./RejectReason";

/**
 * Interação com o usuário.
 */
export class UserInteraction {
  /**
   * Criador de mensagens para o Bus.
   */
  private readonly createBusMessage: ICreateBusMessage;

  /**
   * Histórico de mensagens recebidas do usuário.
   */
  private readonly userMessages: HashJson<UserMessageReceived>;

  /***
   * Construtor.
   * @param createBusMessage Criação de mensagens para o Bus.
   */
  public constructor(createBusMessage?: ICreateBusMessage) {
    this.createBusMessage = createBusMessage ?? new CreateBusMessage();

    const oneMinute = 60000;
    this.userMessages = new HashJson<UserMessageReceived>(oneMinute);

    Message.subscribe(
      BusMessageUndelivered,
      this.handleBusMessageUndelivered.bind(this)
    );
    Message.subscribe(
      UserMessageReceived,
      this.handleUserMessageReceived.bind(this)
    );
  }

  /**
   * Handle: BusMessageUndelivered
   */
  private handleBusMessageUndelivered(message: BusMessageUndelivered): void {
    const userMessageReceived = this.userMessages.get(message.message);

    if (userMessageReceived !== undefined) {
      const userMessageRejected = new UserMessageRejected(
        userMessageReceived,
        RejectReason.Undelivered
      );
      void new SendBusMessage(userMessageRejected).sendAsync();
    }
  }

  /**
   * Handle: UserMessageReceived
   */
  private handleUserMessageReceived(message: UserMessageReceived): void {
    const commandLineParsed = CommandLineParser.parse(message.message);

    const busMessage =
      this.createBusMessage.fromUserCommand(commandLineParsed) ??
      new UserMessageRejected(message, RejectReason.Invalid);

    this.userMessages.set(busMessage, message);

    void new SendBusMessage(busMessage).sendAsync();
  }
}

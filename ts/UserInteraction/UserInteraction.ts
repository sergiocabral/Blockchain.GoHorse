import { HashJson, Message } from "@sergiocabral/helper";

import { BusMessageDeliveryReceipt } from "../Bus/BusMessage/Communication/BusMessageDeliveryReceipt";
import { SendBusMessage } from "../Bus/Message/SendBusMessage";

import { UserMessageDeliveryReceipt } from "./BusMessage/UserMessageDeliveryReceipt";
import { CommandLineParser } from "./CommandLine/CommandLineParser";
import { CreateBusMessage } from "./CreateBusMessage";
import { DeliveryStatus } from "./DeliveryStatus";
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
      BusMessageDeliveryReceipt,
      this.handleBusMessageDeliveryReceipt.bind(this)
    );
    Message.subscribe(
      UserMessageReceived,
      this.handleUserMessageReceived.bind(this)
    );
  }

  /**
   * Handle: BusMessageDeliveryReceipt
   */
  private handleBusMessageDeliveryReceipt(
    message: BusMessageDeliveryReceipt
  ): void {
    const originalMessage = this.userMessages.get(
      message.message.cloneForComparison()
    );

    if (originalMessage !== undefined) {
      const userMessageDeliveryReceipt = new UserMessageDeliveryReceipt(
        originalMessage,
        message.delivered
          ? DeliveryStatus.Delivered
          : DeliveryStatus.Undelivered
      );

      userMessageDeliveryReceipt.addIdentifier(message.message.id);

      void new SendBusMessage(userMessageDeliveryReceipt).sendAsync();
    }
  }

  /**
   * Handle: UserMessageReceived
   */
  private handleUserMessageReceived(message: UserMessageReceived): void {
    const commandLineParsed = CommandLineParser.parse(message.message);

    const busMessage =
      this.createBusMessage.fromUserCommand(commandLineParsed) ??
      new UserMessageDeliveryReceipt(message, DeliveryStatus.Invalid);

    busMessage.addIdentifier(message.id);

    this.userMessages.set(busMessage.cloneForComparison(), message);

    void new SendBusMessage(busMessage).sendAsync();
  }
}

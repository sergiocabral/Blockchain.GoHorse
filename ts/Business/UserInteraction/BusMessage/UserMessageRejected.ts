import { Message } from "@sergiocabral/helper";

import { BusMessage } from "../../../Bus/BusMessage/BusMessage";
import { BusMessageForCommunication } from "../../../Bus/BusMessage/BusMessageForCommunication";
import { FieldValidator } from "../../../Bus/FieldValidator";
import { BusChannel } from "../../Bus/BusChannel";

/**
 * Sinaliza que a mensagem recebida do usuário foi rejeitada.
 */
export class UserMessageRejected extends BusMessageForCommunication {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): UserMessageRejected | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, UserMessageRejected)
        ? (instance as UserMessageRejected)
        : undefined;

    const isValid =
      typeof busMessage?.messageType === "string" &&
      busMessage?.message !== undefined;

    return busMessage !== undefined && isValid
      ? Object.assign(
          new UserMessageRejected({} as unknown as Message),
          busMessage
        )
      : undefined;
  }

  /**
   * Mensagem.
   */
  public readonly message: unknown;

  /**
   * Tipo da mensagem.
   */
  public readonly messageType: string;

  /**
   * Constructor
   * @param message Mensagem que foi rejeitada.
   */
  public constructor(message: Message) {
    super([BusChannel.UserInteraction]);
    this.id = this.hash(`${this.id}${JSON.stringify(this.message)}`);
    this.messageType = message.constructor.name;
    this.message = message;
  }
}

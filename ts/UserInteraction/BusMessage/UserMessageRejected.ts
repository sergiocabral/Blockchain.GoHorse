import { Message } from "@sergiocabral/helper";

import { BusChannel } from "../../Application/Bus/BusChannel";
import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { BusMessageForCommunication } from "../../Bus/BusMessage/BusMessageForCommunication";
import { FieldValidator } from "../../Bus/FieldValidator";
import { IIdentifier } from "../../Core/IIdentifier";
import { RejectReason } from "../RejectReason";

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
          new UserMessageRejected(
            {} as unknown as Message,
            "" as unknown as RejectReason
          ),
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
   * @param reason Motivos para uma mensagem do usuário ser devolvida.
   */
  public constructor(message: Message, public readonly reason: RejectReason) {
    super([BusChannel.UserInteraction]);

    const identifier = (message as unknown as IIdentifier).id;

    this.id = this.hash(
      `${UserMessageRejected.name}${
        identifier ? identifier : JSON.stringify(this.message)
      }`
    );

    this.messageType = message.constructor.name;
    this.message = message;
  }
}

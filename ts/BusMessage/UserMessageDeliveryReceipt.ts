import {
  BusMessage,
  BusMessageForCommunication,
  FieldValidator
} from '@gohorse/npm-bus';
import { IIdentifier } from '@gohorse/npm-core';
import { Message } from '@sergiocabral/helper';
import { DeliveryStatus } from '../Core/DeliveryStatus';
import { BusChannel } from '../Temporary/BusChannel';

/**
 * Sinaliza que a mensagem recebida do usuário foi rejeitada.
 */
export class UserMessageDeliveryReceipt extends BusMessageForCommunication {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(
    instance: unknown
  ): UserMessageDeliveryReceipt | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, UserMessageDeliveryReceipt)
        ? (instance as UserMessageDeliveryReceipt)
        : undefined;

    const isValid =
      typeof busMessage?.messageType === 'string' &&
      busMessage?.message !== undefined;

    return busMessage !== undefined && isValid
      ? Object.assign(
          new UserMessageDeliveryReceipt(
            {} as unknown as Message,
            '' as unknown as DeliveryStatus
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
   * @param status Resultado da entrega da mensagem.
   */
  public constructor(message: Message, public readonly status: DeliveryStatus) {
    super([BusChannel.UserInteraction]);

    const identifier = (message as unknown as IIdentifier).id;

    this.id = this.hash(
      `${UserMessageDeliveryReceipt.name}${
        identifier ? identifier : JSON.stringify(this.message)
      }`
    );

    this.messageType = message.constructor.name;
    this.message = message;
  }
}

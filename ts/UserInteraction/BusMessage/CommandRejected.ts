import { Message } from "@sergiocabral/helper";

import { BotTwitchApplication } from "../../Application/BotTwitch/BotTwitchApplication";
import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { BusMessageForCommunication } from "../../Bus/BusMessage/BusMessageForCommunication";
import { FieldValidator } from "../../Bus/FieldValidator";

/**
 * Sinaliza que o comando recebido do usuário foi rejeitado.
 */
export class CommandRejected extends BusMessageForCommunication {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): CommandRejected | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, CommandRejected)
        ? (instance as CommandRejected)
        : undefined;

    const isValid =
      typeof busMessage?.messageType === "string" &&
      busMessage?.message !== undefined;

    return busMessage !== undefined && isValid
      ? Object.assign(new CommandRejected({} as unknown as Message), busMessage)
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
    super([BotTwitchApplication.name]);
    this.id = this.hash(`${this.id}${JSON.stringify(this.message)}`);
    this.messageType = message.constructor.name;
    this.message = message;
  }
}

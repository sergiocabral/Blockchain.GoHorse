import { FieldValidator } from "../../FieldValidator";
import { BusMessage } from "../BusMessage";
import { BusMessageForCommunication } from "../BusMessageForCommunication";

/**
 * Ninguém pode receber uma mensagem do Bus.
 */
export class BusMessageUndelivered extends BusMessageForCommunication {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusMessageUndelivered | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, BusMessageUndelivered)
        ? (instance as BusMessageUndelivered)
        : undefined;

    return busMessage !== undefined
      ? Object.assign(
          new BusMessageUndelivered({} as unknown as BusMessage),
          busMessage
        )
      : undefined;
  }

  /**
   * Construtor.
   * @param message Mensagem que foi rejeitado.
   */
  public constructor(public message: BusMessage) {
    super([]);
    this.id = this.hash(`${BusMessageUndelivered.name}${this.message.id}`);
    this.clientId = message.clientId;
  }
}

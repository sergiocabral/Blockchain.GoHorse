import { FieldValidator } from "../../FieldValidator";
import { BusMessage } from "../BusMessage";
import { BusMessageForCommunication } from "../BusMessageForCommunication";

/**
 * Ninguém pode receber uma mensagem do Bus.
 */
export class BusMessageDeliveryReceipt extends BusMessageForCommunication {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(
    instance: unknown
  ): BusMessageDeliveryReceipt | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, BusMessageDeliveryReceipt)
        ? (instance as BusMessageDeliveryReceipt)
        : undefined;

    return typeof busMessage?.delivered === "boolean"
      ? Object.assign(
          new BusMessageDeliveryReceipt({} as unknown as BusMessage, false),
          busMessage
        )
      : undefined;
  }

  /**
   * Construtor.
   * @param message Mensagem que foi rejeitado.
   * @param delivered Sinaliza entrega (ou não) da mensagem.
   */
  public constructor(public message: BusMessage, delivered: boolean) {
    super([]);
    this.id = this.hash(`${BusMessageDeliveryReceipt.name}${this.message.id}`);
    this.clientId = message.clientId;
    this.delivered = delivered;
  }
}

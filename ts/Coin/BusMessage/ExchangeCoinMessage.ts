import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { BusMessageForCommunication } from "../../Bus/BusMessage/BusMessageForCommunication";
import { FieldValidator } from "../../Bus/FieldValidator";
import { BusChannel } from "../../Business/Bus/BusChannel";

/**
 * Realiza o câmbio de uma moeda para outra.
 */
export class ExchangeCoinMessage extends BusMessageForCommunication {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): ExchangeCoinMessage | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, ExchangeCoinMessage)
        ? (instance as Record<string, unknown>)
        : undefined;

    const isValid =
      typeof busMessage?.from === "string" &&
      typeof busMessage?.destination === "string" &&
      typeof busMessage?.price === "number" &&
      typeof busMessage?.amount === "number" &&
      (typeof busMessage?.message === "string" ||
        typeof busMessage?.message === "undefined");

    return busMessage !== undefined && isValid
      ? Object.assign(new ExchangeCoinMessage("", "", 0, 0), busMessage)
      : undefined;
  }

  /**
   * Constructor
   * @param from Moeda de origem
   * @param destination Moeda de destino
   * @param price Preço
   * @param amount montante
   * @param message Mensagem pessoal do usuário
   */
  public constructor(
    public readonly from: string,
    public readonly destination: string,
    public readonly price: number,
    public readonly amount: number,
    public readonly message?: string
  ) {
    super([BusChannel.Coin]);
    this.id = this.hash(
      `${this.id}${this.from}${this.destination}${this.price}${this.amount}${this.message}`
    );
  }
}

import { FieldValidator } from "../FieldValidator";

import { BusMessage } from "./BusMessage";

/**
 * Faz o ingresso no Bus.
 */
export class BusMessageJoin extends BusMessage {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusMessageJoin | undefined {
    const busMessage =
      BusMessage.parse(instance) &&
      FieldValidator.type(instance, BusMessageJoin)
        ? (instance as BusMessageJoin)
        : undefined;

    if (
      busMessage &&
      (!Array.isArray(busMessage.channels) || busMessage.channels.length > 0)
    ) {
      return undefined;
    }

    return busMessage !== undefined
      ? Object.assign(new BusMessageJoin("", ""), busMessage)
      : undefined;
  }

  /**
   * Construtor.
   * @param client Identificador do cliente.
   * @param channel Nome do canal.
   */
  public constructor(
    public readonly client: string,
    public readonly channel: string
  ) {
    super([]);
    this.id = this.hash(this.client + this.channel);
  }
}

import { FieldValidator } from "../FieldValidator";

import { BusMessage } from "./BusMessage";

/**
 * Faz o ingresso no Bus.
 */
export class BusJoin extends BusMessage {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  public static parse(instance: unknown): BusJoin | undefined {
    const busMessage =
      BusMessage.parse(instance) && FieldValidator.type(instance, BusJoin)
        ? (instance as BusJoin)
        : undefined;

    if (
      busMessage &&
      (!Array.isArray(busMessage.channels) || busMessage.channels.length > 0)
    ) {
      return undefined;
    }

    return busMessage;
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

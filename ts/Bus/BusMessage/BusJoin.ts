import { BusMessage } from "./BusMessage";

/**
 * Faz o ingresso no Bus.
 */
export class BusJoin extends BusMessage {
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

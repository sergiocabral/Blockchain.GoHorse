import { Message } from "@sergiocabral/helper";

import { BusClient } from "../BusClient";
import { IBusMessage } from "../BusMessage/IBusMessage";

/**
 * Mensagem recebida através do Bus.
 */
export class BusReceived extends Message {
  /**
   * Construtor.
   * @param instance Cliente de acesso ao Bus.
   * @param busMessage Mensagem para o Bus.
   */
  public constructor(
    public readonly instance: BusClient,
    public readonly busMessage: IBusMessage
  ) {
    super();
  }
}

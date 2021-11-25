import { Message } from "@sergiocabral/helper";

import { BusMessage } from "../BusMessage/BusMessage";

/**
 * Envia uma mensagem pelo Bus.
 */
export class SendBusMessage extends Message {
  /**
   * Construtor.
   * @param message Mensagem
   */
  public constructor(public readonly message: BusMessage) {
    super();
  }
}

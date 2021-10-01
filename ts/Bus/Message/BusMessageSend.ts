import { Message } from "@sergiocabral/helper";

import { IBusMessage } from "../BusMessage/IBusMessage";
import { BusMessageClient } from "../BusMessageClient";

/**
 * Envia uma mensagem através do Bus.
 */
export class BusMessageSend extends Message {
  /**
   * Construtor.
   * @param busMessageClient Cliente de acesso ao Bus.
   * @param busMessage Mensagem para o Bus.
   */
  public constructor(
    public readonly busMessageClient: BusMessageClient,
    public readonly busMessage: IBusMessage
  ) {
    super();
  }
}

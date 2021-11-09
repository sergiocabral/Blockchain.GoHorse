import { Message } from "@sergiocabral/helper";

/**
 * Envia uma mensagem para o chat da twitch.
 */
export class SendTwitchChatMessage extends Message {
  /**
   * Construtor.
   * @param channel Canal destinatário
   * @param message Mensagem.
   */
  public constructor(
    public readonly channel: string,
    public readonly message: string
  ) {
    super();
  }
}

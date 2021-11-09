import { Message } from "@sergiocabral/helper";
import { ChatUserstate } from "tmi.js";

/**
 * Mensagem enviada pelo chat da Twitch.
 */
export class TwitchChatMessage extends Message {
  /**
   * Construtor.
   * @param message Mensagem.
   * @param channel Canal.
   * @param username Usuário.
   * @param userstate Dados do usuário.
   */
  public constructor(
    public readonly message: string,
    public readonly channel: string,
    public readonly username: string,
    public readonly userstate: ChatUserstate
  ) {
    super();
  }
}

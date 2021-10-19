import { Message } from "@sergiocabral/helper";
import { ChatUserstate } from "tmi.js";

/**
 * Mensagem enviada pelo chat da Twitch.
 */
export class TwitchChatMessage extends Message {
  /**
   * Construtor.
   * @param message Mensagem.
   * @param username Usuário.
   * @param channel Canal.
   * @param userstate Dados do usuário.
   */
  public constructor(
    public readonly message: string,
    public readonly username: string,
    public readonly channel: string,
    public readonly userstate: ChatUserstate
  ) {
    super();
  }
}

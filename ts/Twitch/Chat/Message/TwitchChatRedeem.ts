import { Message } from "@sergiocabral/helper";
import { ChatUserstate } from "tmi.js";

/**
 * Resgate de recompensa pelo chat da Twitch.
 */
export class TwitchChatRedeem extends Message {
  /**
   * Construtor.
   * @param rewardType Tipo de resgate.
   * @param message Mensagem.
   * @param username Usuário.
   * @param channel Canal.
   * @param userstate Dados do usuário.
   */
  public constructor(
    public readonly rewardType: string,
    public readonly message: string,
    public readonly username: string,
    public readonly channel: string,
    public readonly userstate: ChatUserstate
  ) {
    super();
  }
}

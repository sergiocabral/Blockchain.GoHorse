import { ChatUserstate } from "tmi.js";

import { TwitchChatMessage } from "./TwitchChatMessage";

/**
 * Resgate de recompensa pelo chat da Twitch.
 */
export class TwitchChatRedeem extends TwitchChatMessage {
  /**
   * Construtor.
   * @param id Identificador.
   * @param rewardType Tipo de resgate.
   * @param message Mensagem.
   * @param username Usuário.
   * @param channel Canal.
   * @param userstate Dados do usuário.
   */
  public constructor(
    id: string,
    public readonly rewardType: string,
    message: string,
    username: string,
    channel: string,
    userstate: ChatUserstate
  ) {
    super(id, message, username, channel, userstate);
  }
}

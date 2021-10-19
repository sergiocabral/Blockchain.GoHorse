import { Message } from "@sergiocabral/helper";

import { TwitchChatMessage } from "../../../Twitch/Chat/Message/TwitchChatMessage";
import { TwitchChatRedeem } from "../../../Twitch/Chat/Message/TwitchChatRedeem";

/**
 * Tratamento dos comandos recebidos pelo chat.
 */
export class ChatCommandHandler {
  /**
   * Construtor.
   */
  public constructor() {
    Message.subscribe(
      TwitchChatMessage,
      this.handleTwitchChatMessage.bind(this)
    );
    Message.subscribe(TwitchChatRedeem, this.handleTwitchChatRedeem.bind(this));
  }

  /**
   * Handle: TwitchChatMessage
   */
  private handleTwitchChatMessage(message: TwitchChatMessage): void {
    // TODO: Implementar
  }

  /**
   * Handle: TwitchChatRedeem
   */
  private handleTwitchChatRedeem(message: TwitchChatRedeem): void {
    // TODO: Implementar
  }
}

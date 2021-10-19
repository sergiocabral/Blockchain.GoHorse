import { Message } from "@sergiocabral/helper";

import { TwitchChatMessage } from "../../../ExternalService/Twitch/Chat/Message/TwitchChatMessage";
import { TwitchChatRedeem } from "../../../ExternalService/Twitch/Chat/Message/TwitchChatRedeem";

/**
 * Gerenciador de captura de comandos do chat.
 */
export class ChatListenerHandler {
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

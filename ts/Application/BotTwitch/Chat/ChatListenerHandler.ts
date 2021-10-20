import { Message } from "@sergiocabral/helper";

import { TwitchChatMessage } from "../../../ExternalService/Twitch/Chat/Message/TwitchChatMessage";
import { TwitchChatRedeem } from "../../../ExternalService/Twitch/Chat/Message/TwitchChatRedeem";
import { TwitchHelper } from "../../../ExternalService/Twitch/TwitchHelper";
import { UserMessageReceived } from "../../../UserInteraction/Message/UserMessageReceived";

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
    const user = TwitchHelper.createUserModel(message.userstate);
    void new UserMessageReceived(message.message, user).send();
  }

  /**
   * Handle: TwitchChatRedeem
   */
  private handleTwitchChatRedeem(message: TwitchChatRedeem): void {
    // TODO: Implementar mensagem para ação verificada pela plataforma
  }
}

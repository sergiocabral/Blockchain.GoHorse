import { Logger, Message } from "@sergiocabral/helper";

import { UserMessageReceived } from "./Message/UserMessageReceived";

/**
 * Interação com o usuário.
 */
export class UserInteraction {
  /**
   * Construtor.
   */
  public constructor() {
    Message.subscribe(
      UserMessageReceived,
      this.handleUserMessageReceived.bind(this)
    );
  }

  /**
   * Handle: UserMessageReceived
   */
  private handleUserMessageReceived(message: UserMessageReceived): void {
    // TODO: Implementar ChatListerHandle no namespace UserInteraction.
    Logger.post(
      `From ${message.author.toString()} (redeem: ${message.fromPlatform}): ${
        message.message
      }`
    );
  }
}

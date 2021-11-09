import { TwitchChatMessage } from "../../ExternalService/Twitch/Chat/Message/TwitchChatMessage";
import { TwitchChatRedeem } from "../../ExternalService/Twitch/Chat/Message/TwitchChatRedeem";

export interface ITwitchMessageInfo {
  /**
   * Mensagem original recebida pelo chat.
   */
  originalMessage: TwitchChatMessage | TwitchChatRedeem;

  /**
   * Mensagem enviada pelo Bus
   */
  sentMessage: unknown;

  /**
   * Hash para a mensagem enviada.
   */
  sentMessageHash: string;

  /**
   * Data e hora do envio.
   */
  timestamp: number;
}

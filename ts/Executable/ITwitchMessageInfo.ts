import { TwitchChatMessage, TwitchChatRedeem } from '@gohorse/npm-twitch';

/**
 * Dados associados a uma mensagem da Twitch.
 */
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

import { Message } from '@sergiocabral/helper';
import { ChatUserstate } from 'tmi.js';

/**
 * Mensagem enviada pelo chat da Core.
 */
export class TwitchChatMessage extends Message {
  /**
   * Construtor.
   * @param id Identificador.
   * @param message Mensagem.
   * @param channel Canal.
   * @param username Usuário.
   * @param userstate Dados do usuário.
   */
  public constructor(
    public readonly id: string,
    public readonly message: string,
    public readonly channel: string,
    public readonly username: string,
    public readonly userstate: ChatUserstate
  ) {
    super();
  }
}

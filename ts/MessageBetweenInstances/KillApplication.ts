import { MessageToInstance } from './MessageToInstance';

/**
 * Finaliza outra instância.
 */
export class KillApplication extends MessageToInstance {
  /**
   * Tipo da mensagem.
   */
  public override type = 'KillApplication';
}

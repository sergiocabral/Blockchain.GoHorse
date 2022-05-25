import { MessageToInstance } from './MessageToInstance';

/**
 * Finaliza outra instância.
 */
export class Kill extends MessageToInstance {
  /**
   * Tipo da mensagem.
   */
  public override type = 'Kill';
}

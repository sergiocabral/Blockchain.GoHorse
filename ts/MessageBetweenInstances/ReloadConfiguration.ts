import { MessageToInstance } from './MessageToInstance';

/**
 * Recarrega as configurações de outra instância.
 */
export class ReloadConfiguration extends MessageToInstance {
  /**
   * Tipo da mensagem.
   */
  public override type = 'ReloadConfiguration';
}

import { ApplicationMessage } from '../ApplicationMessage';

/**
 * Sinaliza que as configurações devem ser recarregadas.
 */
export class ReloadConfiguration extends ApplicationMessage {
  /**
   * Tipo.
   */
  public override type = 'ReloadConfiguration';
}

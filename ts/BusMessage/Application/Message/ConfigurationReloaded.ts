import { ApplicationMessage } from '../ApplicationMessage';

/**
 * Sinaliza que as configurações já foram recarregadas e estão prontas para uso.
 */
export class ConfigurationReloaded extends ApplicationMessage {
  /**
   * Tipo.
   */
  public override type = 'ConfigurationReloaded';
}

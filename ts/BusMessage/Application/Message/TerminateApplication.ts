import { ApplicationMessage } from '../ApplicationMessage';

/**
 * Sinaliza que a aplicação deve ser finalizada.
 */
export class TerminateApplication extends ApplicationMessage {
  /**
   * Tipo.
   */
  public override type = 'TerminateApplication';
}

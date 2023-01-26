import { IApplicationWrapper } from './IApplicationWrapper';

/**
 * Wrapper para execução de uma aplicação.
 */
export abstract class ApplicationWrapper implements IApplicationWrapper {
  /**
   * Executa a aplicação.
   */
  public abstract run(): Promise<void>;
}

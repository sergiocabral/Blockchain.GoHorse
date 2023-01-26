import { ApplicationWrapper } from '../Wrapper/ApplicationWrapper';

/**
 * ProcessExecution para executar o Git.
 */
export class GitWrapper extends ApplicationWrapper {
  /**
   * Caminho da aplicação.
   */
  public override readonly path = 'git';
}

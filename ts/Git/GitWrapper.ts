import { ApplicationWrapper } from '../Wrapper/ApplicationWrapper';

/**
 * ProcessExecution para executar o Git.
 */
export class GitWrapper extends ApplicationWrapper {
  /**
   * Caminho da aplicação.
   */
  public override readonly path = 'git';

  /**
   * Obter versão do Git.
   */
  public async version(): Promise<string> {
    const output = await super.run('--version');
    return output.all;
  }
}

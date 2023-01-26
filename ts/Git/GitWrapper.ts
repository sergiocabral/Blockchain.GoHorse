import { ApplicationWrapper } from '../Wrapper/ApplicationWrapper';
import { ProcessExecution } from '../CommandLine/ProcessExecution';

/**
 * CommandLine para executar o Git.
 */
export class GitWrapper extends ApplicationWrapper {
  /**
   * Executa a aplicação.
   */
  public async run(): Promise<void> {
    const processExecution = new ProcessExecution('git', ['--version'], 'C:\\');
    const result = await processExecution.execute();
    console.log(result.all);
  }
}

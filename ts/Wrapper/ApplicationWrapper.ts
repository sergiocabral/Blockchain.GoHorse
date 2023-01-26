import { IApplicationWrapper } from './IApplicationWrapper';
import { ProcessExecution } from '../ProcessExecution/ProcessExecution';
import { IProcessExecutionOutput } from '../ProcessExecution/IProcessExecutionOutput';

/**
 * Wrapper para execução de uma aplicação.
 */
export abstract class ApplicationWrapper implements IApplicationWrapper {
  /**
   * Construtor.
   * @param workingDirectory Diretório de onde a aplicação é executada.
   */
  public constructor(public workingDirectory?: string) {}

  /**
   * Caminho da aplicação.
   */
  public abstract get path(): string;

  /**
   * Executa a aplicação.
   * @param args Argumentos.
   */
  public async run(...args: string[]): Promise<IProcessExecutionOutput> {
    const processExecution = new ProcessExecution(
      this.path,
      args,
      this.workingDirectory
    );
    return await processExecution.execute();
  }
}

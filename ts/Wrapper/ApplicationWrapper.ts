import { IApplicationWrapper } from './IApplicationWrapper';
import { ProcessExecution } from '../ProcessExecution/ProcessExecution';
import { IProcessExecutionOutput } from '../ProcessExecution/IProcessExecutionOutput';

/**
 * Wrapper para execução de uma aplicação.
 */
export abstract class ApplicationWrapper implements IApplicationWrapper {
  /**
   * Verifica se a aplicação resultou em sucesso na sua execução.
   * @param output Saída do aplicação.
   */
  protected isSuccess(output: IProcessExecutionOutput): boolean {
    return output.exitCode === 0 && output.errorLines.length === 0;
  }

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
    const processExecution = new ProcessExecution({
      path: this.path,
      workingDirectory: this.workingDirectory,
      args
    });
    return await processExecution.execute();
  }
}

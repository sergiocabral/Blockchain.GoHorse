import { IApplicationWrapper } from './IApplicationWrapper';
import { ProcessExecution } from '../ProcessExecution/ProcessExecution';
import { IProcessExecutionOutput } from '../ProcessExecution/IProcessExecutionOutput';

/**
 * Wrapper para execução de uma aplicação.
 */
export abstract class ApplicationWrapper implements IApplicationWrapper {
  /**
   * Monta a mensagem de erro (se houver) com base no output.
   * @param output Saída do aplicação.
   */
  protected errorMessage(output: IProcessExecutionOutput): string | undefined {
    return output.exitCode === 0 && output.errorLines.length === 0
      ? undefined
      : `The "${
          this.path
        }" application exit code did not result in success: ${String(
          output.exitCode
        )}`;
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

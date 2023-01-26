import { IProcessExecutionOutput } from '../ProcessExecution/IProcessExecutionOutput';

/**
 * Wrapper para execução de uma aplicação.
 */
export interface IApplicationWrapper {
  /**
   * Diretório de onde a aplicação é executada.
   */
  workingDirectory?: string;

  /**
   * Caminho da aplicação.
   */
  get path(): string;

  /**
   * Executa a aplicação.
   * @param args Argumentos.
   */
  run(...args: string[]): Promise<IProcessExecutionOutput>;
}

import { IProcessExecutionOutput } from './IProcessExecutionOutput';
import { GenericError } from '@sergiocabral/helper';

/**
 * Erro durante a execução de um processo.
 */
export class ProcessExecutionError extends GenericError {
  /**
   * Construtor.
   * @param output Output até o momento da execução do processo.
   * @param innerError Erro original.
   * @protected
   */
  public constructor(
    public readonly output: IProcessExecutionOutput,
    public readonly innerError?: Error | GenericError | unknown
  ) {
    super(
      `Error during process execution. Maybe there are more details in the output.`,
      innerError,
      'ProcessExecutionError'
    );
  }
}

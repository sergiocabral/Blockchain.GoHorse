import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { IProcessExecutionOutput } from './IProcessExecutionOutput';
import { ProcessExecutionOutput } from './ProcessExecutionOutput';
import { IProcessExecutionConfiguration } from './IProcessExecutionConfiguration';
import { ProcessExecutionError } from './ProcessExecutionError';
import { InvalidExecutionError } from '@sergiocabral/helper';

/**
 * Representa a excução de processo.
 */
export class ProcessExecution {
  /**
   * Construtor.
   * @param configuration Parâmetros para execução da aplicação.
   */
  public constructor(public configuration: IProcessExecutionConfiguration) {}

  /**
   * Sinaliza uma execução em andamento.
   */
  private isRunning = false;

  /**
   * Executa a linha de comando.
   * @return Saída do comando.
   */
  public async execute(
    configuration?: IProcessExecutionConfiguration
  ): Promise<IProcessExecutionOutput> {
    return new Promise<IProcessExecutionOutput>((resolve, reject) => {
      configuration = configuration ?? this.configuration;

      this.isRunning = true;

      const spawnOptions: SpawnOptionsWithoutStdio = {
        cwd: this.configuration.workingDirectory,
        windowsHide: this.configuration.windowsHide ?? true,
        detached: this.configuration.detached ?? false
      };

      const childProcess = spawn(
        configuration.path,
        configuration.args,
        spawnOptions
      );

      const result: IProcessExecutionOutput = new ProcessExecutionOutput(
        childProcess
      );

      childProcess.stdout.on('data', (output: Buffer) => {
        result.put(output.toString(), 'standard');
      });

      childProcess.stderr.on('data', (output: Buffer) => {
        result.put(output.toString(), 'error');
      });

      let finished = false;
      const finish = (exit: number | null | Error) => {
        if (finished) {
          throw new InvalidExecutionError(
            'Completion of the process occurred more than once.'
          );
        }
        finished = true;
        this.isRunning = false;
        const isSuccess = typeof exit === 'number' || exit === null;
        if (isSuccess) {
          result.exitCode = exit;
          resolve(result);
        } else {
          result.exitError = exit;
          reject(new ProcessExecutionError(result, exit));
        }
      };

      childProcess.on('close', (exitCode: number | null) => finish(exitCode));

      childProcess.on('error', (exitError: Error) => finish(exitError));

      if (spawnOptions.detached) {
        const verifyExitCode = (): unknown =>
          childProcess.exitCode !== null
            ? finish(childProcess.exitCode)
            : setTimeout(verifyExitCode, 1);
        verifyExitCode();
      }

      configuration.callbackResult = result;
    });
  }
}

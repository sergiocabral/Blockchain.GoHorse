import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { IProcessExecutionOutput } from './IProcessExecutionOutput';
import { ProcessExecutionOutput } from './ProcessExecutionOutput';
import { IProcessExecutionConfiguration } from './IProcessExecutionConfiguration';
import { ProcessExecutionError } from './ProcessExecutionError';

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
        windowsHide: true
      };

      const childProcess = spawn(
        configuration.path,
        configuration.args,
        spawnOptions
      );

      const result: IProcessExecutionOutput = new ProcessExecutionOutput();

      childProcess.stdout.on('data', (output: Buffer) => {
        result.put(output.toString(), 'standard');
      });

      childProcess.stderr.on('data', (output: Buffer) => {
        result.put(output.toString(), 'error');
      });

      childProcess.on('close', (exitCode: number | null) => {
        this.isRunning = false;
        result.exitCode = exitCode;
        resolve(result);
      });

      childProcess.on('error', (exitError: Error) => {
        this.isRunning = false;
        result.exitError = exitError;
        reject(new ProcessExecutionError(result, exitError));
      });
    });
  }
}

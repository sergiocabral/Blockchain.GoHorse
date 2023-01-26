import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { IProcessExecutionOutput } from './IProcessExecutionOutput';
import { ProcessExecutionOutput } from './ProcessExecutionOutput';

/**
 * Representa a excução de processo.
 */
export class ProcessExecution {
  /**
   * Construtor.
   * @param processName Caminho do processo.
   * @param processArguments Argumentos de linha de comando
   * @param workingDirectory Diretório de trabalho.
   */
  public constructor(
    public processName: string,
    public processArguments: string[] = [],
    public workingDirectory?: string
  ) {}

  /**
   * Sinaliza uma execução em andamento.
   */
  private isRunning = false;

  /**
   * Executa a linha de comando.
   * @return Saída do comando.
   */
  public async execute(): Promise<IProcessExecutionOutput> {
    return new Promise<IProcessExecutionOutput>((resolve, reject) => {
      this.isRunning = true;

      const spawnOptions: SpawnOptionsWithoutStdio = {
        cwd: this.workingDirectory ?? undefined,
        windowsHide: true
      };

      const childProcess = spawn(
        this.processName,
        this.processArguments,
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
        reject(result);
      });
    });
  }
}

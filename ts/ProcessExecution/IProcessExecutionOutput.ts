import { ChildProcessWithoutNullStreams } from 'child_process';

/**
 * Texto de saída após a execução de um processo.
 */
export interface IProcessExecutionOutput {
  /**
   * Posta uma mensagem de saída.
   * @param output Mensagem.
   * @param type Tipo de postagem.
   */
  put(output: string, type: 'standard' | 'error'): void;

  /**
   * Limpa todas as saídas.
   */
  clear(): void;

  /**
   * Erro na execução da aplicação.
   */
  exitError: Error | null;

  /**
   * Código de saída da aplicação.
   */
  exitCode: number | null;

  /**
   * Saída padrão.
   */
  standardLines: string[];

  /**
   * Saída padrão.
   */
  standard: string;

  /**
   * Saída de erro.
   */
  errorLines: string[];

  /**
   * Saída de erro.
   */
  error: string;

  /**
   * Todas as saídas juntas.
   */
  allLines: string[];

  /**
   * Todas as saídas juntas.
   */
  all: string;

  /**
   * Processo.
   */
  process: ChildProcessWithoutNullStreams;
}

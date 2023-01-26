import { IProcessExecutionOutput } from './IProcessExecutionOutput';
import { NotImplementedError } from '@sergiocabral/helper';
import { env } from 'process';

/**
 * Texto de saída após a execução de um processo.
 */
export class ProcessExecutionOutput implements IProcessExecutionOutput {
  /**
   * Posta uma mensagem de saída.
   * @param output Mensagem.
   * @param type Tipo de postagem.
   */
  public put(output: string, type: 'standard' | 'error' = 'standard'): void {
    switch (type) {
      case 'standard':
        this.standardValue.push(output);
        break;
      case 'error':
        this.errorValue.push(output);
        break;
      default:
        throw new NotImplementedError(
          'Type os output was not expected: ' + String(type)
        );
    }
    this.allValue.push(output);
  }

  /**
   * Erro na execução da aplicação.
   */
  public exitError: Error | null = null;

  /**
   * Código de saída da aplicação.
   */
  public exitCode: number | null = null;

  /**
   * Limpa todas as saídas.
   */
  public clear(): void {
    this.exitError = null;
    this.exitCode = null;
    this.standardValue.length = 0;
    this.errorValue.length = 0;
    this.allValue.length = 0;
  }

  /**
   * Saída padrão.
   */
  private readonly standardValue: string[] = [];

  /**
   * Saída padrão.
   */
  public get standardLines(): string[] {
    return Array<string>().concat(this.standardValue);
  }

  /**
   * Saída padrão.
   */
  public get standard(): string {
    return this.joinLines(this.standardValue);
  }

  /**
   * Saída de erro.
   */
  private readonly errorValue: string[] = [];

  /**
   * Saída de erro.
   */
  public get errorLines(): string[] {
    return Array<string>().concat(this.errorValue);
  }

  /**
   * Saída de erro.
   */
  public get error(): string {
    return this.joinLines(this.errorValue);
  }

  /**
   * Todas as saídas juntas.
   */
  private readonly allValue: string[] = [];

  /**
   * Todas as saídas juntas.
   */
  public get allLines(): string[] {
    return Array<string>().concat(this.allValue);
  }

  /**
   * Todas as saídas juntas.
   */
  public get all(): string {
    return this.joinLines(this.allValue);
  }

  /**
   * Mesclagem de linhas.
   * @param lines Linhas.
   */
  private joinLines(lines: string[]): string {
    return lines.join(env.EOL);
  }
}

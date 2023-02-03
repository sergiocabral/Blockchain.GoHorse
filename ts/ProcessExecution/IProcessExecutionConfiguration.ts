import { IProcessExecutionOutput } from './IProcessExecutionOutput';

/**
 * Configurações para execução de um processo.
 */
export interface IProcessExecutionConfiguration {
  /**
   * Diretório de onde será feita a execução.
   */
  workingDirectory?: string;

  /**
   * Caminho do processo.
   */
  path: string;

  /**
   * Argumentos padrão.
   */
  args: string[];

  /**
   * Antecipação do retorno da função.
   */
  callbackResult?: IProcessExecutionOutput;

  /**
   * Esconde a janela
   */
  windowsHide?: boolean;

  /**
   * Desanexar do processo.
   */
  detached?: boolean;
}

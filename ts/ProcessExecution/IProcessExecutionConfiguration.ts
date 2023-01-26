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
}

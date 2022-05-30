import { IPackageJson } from '@sergiocabral/helper';

/**
 * Parâmetros de execução da aplicação.
 */
export interface IApplicationParameters {
  /**
   * Diretório da aplicação.
   */
  get applicationDirectory(): string;

  /**
   * Diretório inicial de execução da aplicação.
   */
  get inicialDirectory(): string;

  /**
   * Identificador para a instância da aplicação atualmente em execução.
   */
  get applicationId(): string;

  /**
   * Data e hora da execução
   */
  get startupTime(): Date;

  /**
   * Nome a aplicação.
   */
  get applicationName(): string;

  /**
   * Versão da aplicação.
   */
  get applicationVersion(): string;

  /**
   * Caminho do arquivo de configuração.
   */
  get configurationFile(): string;

  /**
   * Caminho do arquivo que sinaliza que a aplicação está em execução.
   */
  get applicationFlagFile(): string;

  /**
   * Nome da aplicação a ser executada.
   */
  get packageJson(): IPackageJson;
}

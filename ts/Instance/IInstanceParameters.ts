import { IPackageJson } from '@sergiocabral/helper';

/**
 * Parâmetros relacionados a instância atual do pacote.
 */
export interface IInstanceParameters {
  /**
   * Identificador.
   */
  get id(): string;

  /**
   * Data e hora da execução.
   */
  get startupTime(): Date;

  /**
   * Diretório de onde foi executado.
   */
  get startupDirectory(): string;

  /**
   * Diretório do pacote npm.
   */
  get packageDirectory(): string;

  /**
   * Nome do pacote npm.
   */
  get packageName(): string;

  /**
   * Versão do pacote npm.
   */
  get packageVersion(): string;

  /**
   * JSON do arquivo package.json do npm.
   */
  get packageJson(): IPackageJson;
}

import { IInstanceParameters } from '@gohorse/npm-core';
import { IApplication } from './IApplication';

/**
 * Parâmetros relacionados a instância atual do pacote.
 */
export interface IApplicationParameters extends IInstanceParameters {
  /**
   * Instância da aplicação.
   */
  get application(): IApplication;

  /**
   * Nome da aplicação.
   */
  get applicationName(): string;

  /**
   * Caminho do arquivo de configuração.
   */
  get configurationFile(): string;

  /**
   * Caminho do arquivo que sinaliza que a aplicação está em execução e
   * recebe mensagens de outras instâncias.
   */
  get flagFile(): string;
}

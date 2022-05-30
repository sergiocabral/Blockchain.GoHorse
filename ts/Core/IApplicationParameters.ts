import { IInstanceParameters } from '@gohorse/npm-core';

/**
 * Parâmetros relacionados a instância atual do pacote.
 */
export interface IApplicationParameters extends IInstanceParameters {
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

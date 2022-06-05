import { GlobalDefinition } from '@gohorse/npm-core';

/**
 * Definições hard-coded.
 */
export class Definition {
  /**
   * Tempo de espera em milesegundos para verificar novamente a conexão quando estiver no estado Switching.
   */
  public static readonly TIME_TO_RECHECK_CONNECTION_STATUS_IN_MILLISECONDS =
    GlobalDefinition.TIME_OF_ONE_SECOND_IN_MILLISECONDS;
}

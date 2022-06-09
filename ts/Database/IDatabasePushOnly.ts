import { IConnectionState, PrimitiveValueType } from '@sergiocabral/helper';

/**
 * Representa uma conexão com o banco de dados que recebe dados em única via.
 */
export interface IDatabasePushOnly extends IConnectionState {
  /**
   * Grava um conjuntos de valores em única via, tipo log.
   * @param values Campos e valores.
   * @param extra Valores extra
   */
  push(
    values: Record<string, PrimitiveValueType | Date | undefined>,
    extra?: unknown
  ): Promise<this> | this;
}

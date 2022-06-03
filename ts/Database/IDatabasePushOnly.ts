import { IConnectionState, PrimitiveValueType } from '@sergiocabral/helper';

/**
 * Representa uma conexão com o banco de dados que recebe dados em única via.
 */
export interface IDatabasePushOnly extends IConnectionState {
  /**
   * Grava um conjuntos de valores.
   * @param values Campos e valores.
   * @param extra Valores extra em formato para JSON
   */
  push(
    values: Record<string, PrimitiveValueType | undefined>,
    extra: Record<string, PrimitiveValueType | undefined> | PrimitiveValueType[]
  ): Promise<this> | this;
}

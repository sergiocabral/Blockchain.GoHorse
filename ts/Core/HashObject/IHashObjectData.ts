/**
 * Representa um conjunto de informações para HashObject.
 */
export interface IHashObjectData<TValue> {
  /**
   * Data de expiração da informação.
   */
  expirationTime: number | undefined;

  /**
   * Chave que referencia o valor.
   */
  key: unknown;

  /**
   * Valor armazenado.
   */
  value: TValue;
}

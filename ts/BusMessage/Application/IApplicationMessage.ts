/**
 * Representa uma mensagem entre aplicações.
 */
export interface IApplicationMessage {
  /**
   * Identificador.
   */
  id: string;

  /**
   * Tipo.
   */
  type: string;

  /**
   * Remetente.
   */
  fromApplicationId: string;

  /**
   * Destinatário.
   */
  toApplicationId: string;
}

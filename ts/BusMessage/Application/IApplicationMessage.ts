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
  fromInstanceId: string;

  /**
   * Destinatário.
   */
  toInstanceId: string;
}

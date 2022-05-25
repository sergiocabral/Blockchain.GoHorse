/**
 * Representa uma mensagem entre instâncias.
 */
export interface IMessageToInstance {
  /**
   * Identificador da mensagem.
   */
  identifier: string;

  /**
   * Tipo da mensagem.
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

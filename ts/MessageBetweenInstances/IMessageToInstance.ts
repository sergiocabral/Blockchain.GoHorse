/**
 * Representa uma mensagem entre instâncias.
 */
export interface IMessageToInstance {
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

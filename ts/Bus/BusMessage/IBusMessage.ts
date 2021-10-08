/**
 * Representa uma mensagem trafegada pelo Bus
 */
export interface IBusMessage {
  /**
   * Canais destinatários.
   */
  channels: string[];

  /**
   * Identificador do cliente.
   */
  clientId?: string;

  /**
   * Identificador único.
   */
  id: string;

  /**
   * Tipo da mensagem.
   */
  type: string;
}

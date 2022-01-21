/**
 * Resultados possíveis da entrega da mensagem.
 */
export enum DeliveryStatus {
  /**
   * Mensagem inválida.
   */
  Invalid = 'Invalid',

  /**
   * Não houve receptor da mensagem. Tente mais tarde.
   */
  Undelivered = 'Undelivered',

  /**
   * Mensagem entregue.
   */
  Delivered = 'Delivered'
}

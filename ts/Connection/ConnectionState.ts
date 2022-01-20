/**
 * Estados de uma conexão.
 */
export enum ConnectionState {
  /**
   * Fechada.
   */
  Closed = 'Closed',

  /**
   * Conectando.
   */
  Connecting = 'Connecting',

  /**
   * Conectado e prontro para uso..
   */
  Ready = 'Ready'
}

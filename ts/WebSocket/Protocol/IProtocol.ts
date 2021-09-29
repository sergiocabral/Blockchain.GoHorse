/**
 * Protocolo de comunicação sobre websocket.
 */
export interface IProtocol {
  /**
   * Identificador do protocolo.
   */
  get identifier(): string;
}

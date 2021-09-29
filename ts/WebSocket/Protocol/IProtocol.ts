/**
 * Protocolo de comunicação sobre websocket.
 */
export interface IProtocol {
  /**
   * Recebe uma mensagem.
   */
  receive(message: string): void;
}

/**
 * Protocolo de comunicação sobre websocket.
 */
export interface IProtocol {
  /**
   * Evento: mensagem recebida do meio externo.
   */
  onMessageReceived: Array<(message: string) => void>;

  /**
   * Recebe um pacote externo.
   */
  receive(packet: string): void;

  /**
   * Transmite uma mensagem interna.
   */
  transmit(message: string): void;
}

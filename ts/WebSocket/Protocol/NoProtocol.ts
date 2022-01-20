import { ProtocolBase } from './ProtocolBase';

/**
 * Protocolo sem nenhuma ação.
 */
export class NoProtocol extends ProtocolBase {
  /**
   * Recebe um pacote externo.
   */
  public override receive(packet: string): void {
    this.onMessageReceived.forEach(onMessageReceived =>
      onMessageReceived(packet)
    );
  }

  /**
   * Transmite uma mensagem interna.
   */
  public override transmit(message: string): void {
    this.client.send(message, 'raw');
  }
}

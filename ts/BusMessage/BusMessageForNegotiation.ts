import { BusMessage } from './BusMessage';
import { WebSocketClient } from '@gohorse/npm-websocket';

/**
 * Classe base para mensagens do bus usada para negociação entre cliente e servidor.
 */
export abstract class BusMessageForNegotiation extends BusMessage {
  /**
   * Instância do cliente websocket.
   */
  public client?: WebSocketClient;

  /**
   * Mensagem de resposta se houver.
   */
  public response?: BusMessage;
}

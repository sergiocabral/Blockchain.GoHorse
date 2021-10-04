import { WebSocketClient } from "../WebSocketClient";

import { IProtocol } from "./IProtocol";

/**
 * Classe base para implementação de um protocolo de comunicação sobre websocket.
 */
export abstract class ProtocolBase implements IProtocol {
  /**
   * Evento: mensagem recebida do meio externo.
   */
  public readonly onMessageReceived: Array<(message: string) => void> = [];

  /**
   * Construtor.
   * @param client Cliente websocket.
   */
  public constructor(protected readonly client: WebSocketClient) {}

  /**
   * Recebe um pacote externo.
   */
  public abstract receive(packet: string): void;

  /**
   * Transmite uma mensagem interna.
   */
  public abstract transmit(message: string): void;
}

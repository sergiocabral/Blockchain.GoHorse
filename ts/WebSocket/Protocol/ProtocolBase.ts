import { IProtocol } from "./IProtocol";

/**
 * Classe base para implementação de um protocolo de comunicação sobre websocket.
 */
export abstract class ProtocolBase implements IProtocol {
  /**
   * Identificador do protocolo.
   */
  public abstract get identifier(): string;
}

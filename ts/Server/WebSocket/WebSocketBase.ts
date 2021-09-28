import { IProtocol } from "./Protocol/IProtocol";

/**
 * Classe base para implementação da comunicação de servidor e cliente websocket.
 */
export abstract class WebSocketBase {
  /**
   * Construtor.
   * @param protocol Protocolo de comunicação.
   */
  public constructor(protected readonly protocol: new () => IProtocol) {}
}

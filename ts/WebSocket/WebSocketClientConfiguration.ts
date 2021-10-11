import { JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../Core/JsonLoaderFieldErrors";

/**
 * Configurações do cliente de conexão com servidor websocket.
 */
export class WebSocketClientConfiguration extends JsonLoader {
  /**
   * Porta de conexão.
   */
  public port = 3000;

  /**
   * Protocolo de conexão.
   */
  public protocol = "ws";

  /**
   * Endereço do servidor.
   */
  public server = "localhost";

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.listOfText(this, "protocol", ["ws", "wss"])
    );
    errors.push(...JsonLoaderFieldErrors.server(this));
    errors.push(...JsonLoaderFieldErrors.port(this));
    errors.push(...super.errors());

    return errors;
  }
}

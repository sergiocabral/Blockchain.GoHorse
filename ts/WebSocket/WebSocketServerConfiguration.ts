import { JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../Core/JsonLoaderFieldErrors";

/**
 * Configurações do servidor websocket.
 */
export class WebSocketServerConfiguration extends JsonLoader {
  /**
   * Porta de rede do serviço.
   */
  public port = 3000;

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.integerBetween(this, "port", [
        0,
        Number.MAX_SAFE_INTEGER,
      ])
    );
    errors.push(...super.errors());

    return errors;
  }
}

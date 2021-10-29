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
      ...JsonLoaderFieldErrors.numberBetween(
        this,
        "port",
        [0, Number.MAX_SAFE_INTEGER],
        "integer"
      )
    );
    errors.push(...super.errors());

    return errors;
  }
}

import { HelperObject, JsonLoader } from "@sergiocabral/helper";

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
    const className = this.constructor.name;

    const errors = Array<string>();

    const json: Partial<WebSocketClientConfiguration> = this;
    let property = "protocol";
    let value: unknown = HelperObject.getProperty(json, property);
    if (!(typeof value === "string" && (value === "ws" || value === "wss"))) {
      errors.push(
        `${className}.${property} must be "ws" or "wss", but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    property = "server";
    value = HelperObject.getProperty(json, property);
    if (!(typeof value === "string" && value.length > 0)) {
      errors.push(
        `${className}.${property} must be a not empty string, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    property = "port";
    value = HelperObject.getProperty(json, property);
    if (
      !(
        typeof value === "number" &&
        Number.isFinite(value) &&
        Math.floor(value) === value &&
        value > 0
      )
    ) {
      errors.push(
        `${className}.${property} must be a integer greater than zero, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    errors.push(...super.errors());

    return errors;
  }
}

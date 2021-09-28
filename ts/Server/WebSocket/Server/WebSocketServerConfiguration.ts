import { Configuration } from "@sergiocabral/helper";

/**
 * Configurações do servidor websocket.
 */
export class WebSocketServerConfiguration extends Configuration {
  /**
   * Porta de rede do serviço.
   */
  public port = 3000;

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const className = this.constructor.name;

    const errors = Array<string>();

    const json: Partial<WebSocketServerConfiguration> = this;
    const property = "port";
    const value = json[property];
    if (
      !(
        typeof value === "number" &&
        Number.isFinite(value) &&
        Math.floor(value) === value &&
        value > 0
      )
    ) {
      errors.push(
        `${className}.${property} must be a integer greater than zero, but found: ${value}`
      );
    }

    errors.push(...super.errors());

    return errors;
  }
}

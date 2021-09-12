import { Configuration } from "../Core/Configuration";

/**
 * Configurações do webserver.
 */
export class WebserverConfiguration extends Configuration<WebserverConfiguration> {
  /**
   * Porta de rede do serviço.
   */
  public port = 3000;

  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json?: unknown) {
    super(json);
    this.load();
  }

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const className = this.constructor.name;

    const errors = Array<string>();

    const json: Partial<WebserverConfiguration> = this;
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

    return errors;
  }
}

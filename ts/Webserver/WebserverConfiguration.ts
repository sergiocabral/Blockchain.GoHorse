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
  }

  /**
   * Verificar erros num JSON de configuração.
   */
  protected getErrors(json: Partial<WebserverConfiguration>): string[] {
    const errors = Array<string>();
    const className = this.constructor.name;

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
        `${className}.${property} must be a integer greater than zero.`
      );
    }

    return errors;
  }
}

import { Configuration } from "../Core/Configuration";

/**
 * Configurações do webserver.
 */
export class WebserverConfiguration extends Configuration<WebserverConfiguration> {
  /**
   * Porta de rede do serviço.
   */
  public port: number;

  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json: unknown) {
    super(json);

    this.port = this.json.port;
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

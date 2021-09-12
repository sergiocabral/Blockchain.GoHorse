import { Configuration } from "../../Core/Configuration";
import { WebserverConfiguration } from "../../Webserver/WebserverConfiguration";

/**
 * Configurações do webserver.
 */
export class BusConfiguration extends Configuration<BusConfiguration> {
  /**
   * Configurações do webserver.
   */
  public webserver: WebserverConfiguration;

  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json?: unknown) {
    super(json);
    const thisInitialized = this.initialize();
    this.webserver = new WebserverConfiguration(thisInitialized.webserver);
  }

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const className = this.constructor.name;

    const errors = Array<string>();

    errors.push(
      ...this.webserver.errors().map((error) => `${className}.${error}`)
    );

    return errors;
  }
}

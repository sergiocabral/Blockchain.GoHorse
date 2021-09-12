import { Configuration } from "../../Core/Configuration";

/**
 * Configurações do webserver.
 */
export class BusConfiguration extends Configuration<BusConfiguration> {
  /**
   * Porta do serviço
   */
  public port = 1235;

  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json?: unknown) {
    super(json);
    this.loadFromJson();
  }

  /**
   * Verificar erros num JSON de configuração.
   */
  protected getErrors(json: Partial<BusConfiguration>): string[] {
    return [];
  }
}

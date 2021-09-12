import { Configuration } from "../../Core/Configuration";

/**
 * Configurações do webserver.
 */
export class PusherConfiguration extends Configuration<PusherConfiguration> {
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
  protected getErrors(json: Partial<PusherConfiguration>): string[] {
    return [];
  }
}

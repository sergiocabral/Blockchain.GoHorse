import { Configuration } from "../../Core/Configuration";

/**
 * Configurações do webserver.
 */
export class MinerConfiguration extends Configuration<MinerConfiguration> {
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
  protected getErrors(json: Partial<MinerConfiguration>): string[] {
    return [];
  }
}

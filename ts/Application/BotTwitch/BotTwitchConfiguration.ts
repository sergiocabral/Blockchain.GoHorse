import { Configuration } from "../../Core/Configuration";

/**
 * Configurações do webserver.
 */
export class BotTwitchConfiguration extends Configuration<BotTwitchConfiguration> {
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
  protected getErrors(json: Partial<BotTwitchConfiguration>): string[] {
    return [];
  }
}

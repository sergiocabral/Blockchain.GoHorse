import { Configuration } from "@sergiocabral/helper";

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends Configuration {
  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json?: unknown) {
    super(json);
    this.initialize();
  }
}

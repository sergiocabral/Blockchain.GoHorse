import { Configuration } from "@sergiocabral/helper";

/**
 * Configurações do PusherApplication
 */
export class PusherConfiguration extends Configuration {
  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json?: unknown) {
    super(json);
    this.initialize();
  }
}

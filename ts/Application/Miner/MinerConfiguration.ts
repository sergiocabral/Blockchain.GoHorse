import { Configuration } from "@sergiocabral/helper";

/**
 * Configurações do MinerApplication
 */
export class MinerConfiguration extends Configuration {
  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json?: unknown) {
    super(json);
    this.initialize();
  }
}

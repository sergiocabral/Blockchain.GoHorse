import { Configuration } from "@sergiocabral/helper";

/**
 * Configurações do DatabaseApplication
 */
export class DatabaseConfiguration extends Configuration {
  /**
   * Construtor.
   * @param json Dados de configuração.
   */
  public constructor(json?: unknown) {
    super(json);
    this.initialize();
  }
}

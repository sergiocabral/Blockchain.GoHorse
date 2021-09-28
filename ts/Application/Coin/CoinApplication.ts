import { Logger } from "@sergiocabral/helper";

import { Application } from "../../Core/Application";

import { CoinConfiguration } from "./CoinConfiguration";

/**
 * Manipulador da criptomoeda.
 */
export class CoinApplication extends Application<CoinConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = CoinConfiguration;

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(`START: ${this.constructor.name}`);
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    Logger.post(`STOP: ${this.constructor.name}`);
  }
}

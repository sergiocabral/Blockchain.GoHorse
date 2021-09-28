import { Logger } from "@sergiocabral/helper";

import { Application } from "../../Core/Application";

import { MinerConfiguration } from "./MinerConfiguration";

/**
 * Minerador.
 */
export class MinerApplication extends Application<MinerConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = MinerConfiguration;

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

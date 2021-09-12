import { Logger } from "@sergiocabral/helper";

import { Application } from "../../Core/Application";

import { PusherConfiguration } from "./PusherConfiguration";

/**
 * Aquele que envia alterações pendentes para o repositório.
 */
export class PusherApplication extends Application<PusherConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = PusherConfiguration;

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
  }
}

import { Logger } from "@sergiocabral/helper";

import { Application } from "../../Core/Application";

import { BusConfiguration } from "./BusConfiguration";

/**
 * Barramento de mensagens para comunicação entre as aplicações.
 */
export class BusApplication extends Application<BusConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = BusConfiguration;

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
    Logger.post(String(this.configuration.webserver.port));
  }
}

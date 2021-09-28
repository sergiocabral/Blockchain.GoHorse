import { Logger } from "@sergiocabral/helper";

import { Application } from "../../Core/Application";

import { BotTwitchConfiguration } from "./BotTwitchConfiguration";

/**
 * Bot que ouve comandos no chat da Twitch.
 */
export class BotTwitchApplication extends Application<BotTwitchConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = BotTwitchConfiguration;

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

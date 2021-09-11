import { Logger } from "@sergiocabral/helper";

import { IApplication } from "../../Core/IApplication";

/**
 * Bot que ouve comandos no chat da Twitch.
 */
export class BotTwitchApplication implements IApplication {
  /**
   * Nome da aplicação.
   */
  public readonly name = "twitch";

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
  }
}

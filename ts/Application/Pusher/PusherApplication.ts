import { Logger } from "@sergiocabral/helper";

import { IApplication } from "../../Core/IApplication";

/**
 * Aquele que envia alterações pendentes para o repositório.
 */
export class PusherApplication implements IApplication {
  /**
   * Nome da aplicação.
   */
  public readonly name = "pusher";

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
  }
}

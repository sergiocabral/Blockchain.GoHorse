import { Logger } from "@sergiocabral/helper";

import { IApplication } from "../../Core/IApplication";

/**
 * Barramento de mensagens para comunicação entre as aplicações.
 */
export class BusApplication implements IApplication {
  /**
   * Nome da aplicação.
   */
  public get name() {
    return "bus";
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
  }
}

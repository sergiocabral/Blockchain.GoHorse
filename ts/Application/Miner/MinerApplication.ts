import { Logger } from "@sergiocabral/helper";

import { IApplication } from "../../Core/IApplication";

/**
 * Minerador.
 */
export class MinerApplication implements IApplication {
  /**
   * Nome da aplicação.
   */
  public get name() {
    return "miner";
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
  }
}

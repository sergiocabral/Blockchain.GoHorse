import { Logger } from "@sergiocabral/helper";

import { IApplication } from "../../Core/IApplication";

/**
 * Manipulador da criptomoeda.
 */
export class CoinApplication implements IApplication {
  /**
   * Nome da aplicação.
   */
  public get name() {
    return "coin";
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
  }
}

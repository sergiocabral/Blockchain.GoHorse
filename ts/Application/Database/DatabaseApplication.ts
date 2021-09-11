import { Logger } from "@sergiocabral/helper";

import { IApplication } from "../../Core/IApplication";

/**
 * Manipulador do banco de dados.
 */
export class DatabaseApplication implements IApplication {
  /**
   * Nome da aplicação.
   */
  public get name() {
    return "database";
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
  }
}

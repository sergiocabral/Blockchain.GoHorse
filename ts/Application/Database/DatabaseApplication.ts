import { Logger } from "@sergiocabral/helper";

import { Application } from "../../Core/Application";

import { DatabaseConfiguration } from "./DatabaseConfiguration";

/**
 * Manipulador do banco de dados.
 */
export class DatabaseApplication extends Application<DatabaseConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = DatabaseConfiguration;

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

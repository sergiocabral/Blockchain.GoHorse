import { NotReadyError } from "@sergiocabral/helper";

import { IDatabase } from "../Database/IDatabase";

/**
 * Database especializado para o Bus.
 */
export class BusDatabase {
  /**
   * Construtor.
   * @param databaseValue Banco de dados.
   */
  public constructor(private readonly databaseValue: IDatabase) {}

  /**
   * Banco de dados com conexão pronta para uso.
   */
  private get database(): IDatabase {
    if (!this.databaseValue.opened) {
      throw new NotReadyError("The database connection is not open.");
    }

    return this.databaseValue;
  }
}

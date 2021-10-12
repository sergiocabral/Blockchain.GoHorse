import { NotReadyError } from "@sergiocabral/helper";

import { IDatabase } from "../Database/IDatabase";

/**
 * Database especializado para o Bus.
 */
export class BusDatabase {
  /**
   * Definições da estrutura do banco de dados.
   */
  private readonly DEFINITION = {
    fieldClientId: "clientId",
    fieldClientName: "clientName",
    tableClient: "clients",
  };

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

  /**
   * Um cliente ingressou.
   */
  public async clientJoin(clientId: string, clientName: string): Promise<void> {
    const value: Record<string, unknown> = {};
    value[this.DEFINITION.fieldClientId] = clientId;
    value[this.DEFINITION.fieldClientName] = clientName;

    await this.database.ensureTable(this.DEFINITION.tableClient);
    await this.database.set(this.DEFINITION.tableClient, clientId, value);
  }

  /**
   * Um cliente sai.
   */
  public async clientLeave(clientId: string): Promise<void> {
    await this.database.ensureTable(this.DEFINITION.tableClient);
    await this.database.del(this.DEFINITION.tableClient, clientId);
  }
}

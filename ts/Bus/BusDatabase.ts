import { NotReadyError, ShouldNeverHappenError } from "@sergiocabral/helper";

import { IDatabase } from "../Database/IDatabase";

import { IBusMessage } from "./BusMessage/IBusMessage";

/**
 * Database especializado para o Bus.
 */
export class BusDatabase {
  /**
   * Valor incremental para compor identificadores baseados no tempo.
   */
  private static timeIdNonce = 0;

  /**
   * Definições da estrutura do banco de dados.
   */
  private readonly DEFINITION = {
    fieldChannelName: "channel",
    fieldClientId: "id",
    tableClient: "clients",
    tableMessage: "messages",
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
  public async clientJoin(
    clientId: string,
    channelName: string
  ): Promise<void> {
    const value: Record<string, unknown> = {};
    value[this.DEFINITION.fieldClientId] = clientId;
    value[this.DEFINITION.fieldChannelName] = channelName;

    await this.database.set(this.DEFINITION.tableClient, clientId, value);
  }

  /**
   * Um cliente sai.
   */
  public async clientLeave(clientId: string): Promise<void> {
    await this.database.del(this.DEFINITION.tableClient, clientId);
  }

  /**
   * Posta uma mensagem do Bus.
   */
  public async postMessage(message: IBusMessage): Promise<void> {
    if (!message.clientId) {
      throw new ShouldNeverHappenError();
    }

    const timeId = await this.database.timeId();
    const id = `${timeId}:${message.clientId}:${BusDatabase.timeIdNonce += 1}`;
    await this.database.set(this.DEFINITION.tableMessage, id, message);
  }
}

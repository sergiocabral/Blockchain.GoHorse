import { NotReadyError, ShouldNeverHappenError } from "@sergiocabral/helper";

import { IDatabase } from "../Database/IDatabase";

import { Bus } from "./Bus";
import { BusMessage } from "./BusMessage/BusMessage";

/**
 * Database especializado para o Bus.
 */
export class BusDatabase {
  /**
   * Evento: quando uma mensagem é recebida.
   */
  public readonly onMessageReceived: Set<(clientId: string) => void> = new Set<
    (clientId: string) => void
  >();

  /**
   * Definições da estrutura do banco de dados.
   */
  private readonly DEFINITION = {
    tableChannel: "channels",
    tableMessage: "messages",
  };

  /**
   * Construtor.
   * @param databaseValue Banco de dados.
   */
  public constructor(private readonly databaseValue: IDatabase) {
    this.databaseValue.onMessage.add(this.handleMessage.bind(this));
  }

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
    await this.database.addValues(this.DEFINITION.tableChannel, channelName, [
      { id: clientId },
    ]);
    await this.database.subscribe(clientId);
  }

  /**
   * Um cliente sai.
   */
  public async clientLeave(clientId: string): Promise<void> {
    await this.database.unsubscribe(clientId);
    await this.database.removeValues(this.DEFINITION.tableChannel, undefined, [
      clientId,
    ]);
    await this.database.removeValues(this.DEFINITION.tableMessage, [clientId]);
  }

  /**
   * Retorna as mensagens pendentes para um cliente.
   */
  public async getMessages(clientId: string): Promise<string[]> {
    const messages = await this.database.getValues(
      this.DEFINITION.tableMessage,
      [clientId]
    );
    await this.database.removeValues(
      this.DEFINITION.tableMessage,
      [clientId],
      messages.map((message) => message.id)
    );

    return messages.map((message) => JSON.stringify(message));
  }

  /**
   * Posta uma mensagem do Bus.
   */
  public async postMessage(message: BusMessage): Promise<void> {
    if (!message.clientId) {
      throw new ShouldNeverHappenError();
    }

    const clientsIds = (
      await this.database.getValues(
        this.DEFINITION.tableChannel,
        message.channels.includes(Bus.ALL_CHANNELS)
          ? undefined
          : message.channels
      )
    ).map((client) => client.id);

    for (const clientId of clientsIds) {
      if (message.clientId === clientId) {
        continue;
      }

      await this.database.addValues(this.DEFINITION.tableMessage, clientId, [
        message,
      ]);

      await this.database.notify(clientId);
    }
  }

  /**
   * Handle: Notificação recebida em um canal.
   * @param channel Canal
   */
  private handleMessage(channel: string): void {
    this.onMessageReceived.forEach((onMessageReceived) =>
      onMessageReceived(channel)
    );
  }
}

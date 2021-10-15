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
  public readonly onMessageReceived: Set<(rawMessage: string) => void> =
    new Set<(rawMessage: string) => void>();

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
      clientId,
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
   * Posta uma mensagem do Bus.
   */
  public async postMessage(message: BusMessage): Promise<void> {
    if (!message.clientId) {
      throw new ShouldNeverHappenError();
    }

    const clientsIds = await this.database.getValues(
      this.DEFINITION.tableChannel,
      message.channels.includes(Bus.ALL_CHANNELS) ? undefined : message.channels
    );

    for (const clientId of clientsIds) {
      await this.database.addValues(this.DEFINITION.tableMessage, clientId, [
        message,
      ]);
    }
  }

  /**
   * Handle: Mensagem recebida via notificação.
   * @param channel Canal.
   * @param message Mensagem.
   */
  private handleMessage(channel: string, message: string): void {
    this.onMessageReceived.forEach((onMessageReceived) =>
      onMessageReceived(message)
    );
  }
}

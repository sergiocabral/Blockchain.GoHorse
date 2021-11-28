import { NotReadyError, ShouldNeverHappenError } from "@sergiocabral/helper";

import { ConnectionState } from "../Core/Connection/ConnectionState";
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
    tableLock: "locks",
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
    if (this.databaseValue.state !== ConnectionState.Ready) {
      throw new NotReadyError("The database connection is not open.");
    }

    return this.databaseValue;
  }

  /**
   * Um cliente ingressou.
   */
  public async clientJoin(
    serverId: string,
    clientId: string,
    channelName: string
  ): Promise<void> {
    await this.database.addValues(this.DEFINITION.tableChannel, channelName, [
      {
        content: JSON.stringify(
          {
            serverId,
            // tslint:disable-next-line:object-literal-sort-keys
            clientId,
            joined: {
              datetime: (
                await this.database.time()
              ).format({ mask: "universal" }),
              timestamp: new Date().getTime(),
            },
          },
          undefined,
          " "
        ),
        id: clientId,
      },
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

    for (const message of messages) {
      await this.database.addHistory(
        this.DEFINITION.tableMessage,
        clientId,
        message.content
      );
    }

    return messages.map((message) => message.content);
  }

  /**
   * Tenta fazer um bloqueio
   * @param lockId Identificador do lock.
   * @param clientId Identificador do cliente.
   * @param timeoutInSeconds Tempo de expiração. Se não informado usa o tempo padrão do banco de dados.
   * @returns Retorna true se tiver sucesso.
   */
  public async lock(
    lockId: string,
    clientId: string,
    timeoutInSeconds?: number
  ): Promise<boolean> {
    return this.database.lock(
      this.DEFINITION.tableLock,
      lockId,
      clientId,
      timeoutInSeconds
    );
  }

  /**
   * Posta uma mensagem do Bus.
   * @param message Mensagem.
   * @returns Indica se alguém leu a mensagem.
   */
  public async postMessage(message: BusMessage): Promise<boolean> {
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
      await this.database.addValues(this.DEFINITION.tableMessage, clientId, [
        { id: message.id, content: JSON.stringify(message, undefined, " ") },
      ]);

      await this.database.notify(clientId);
    }

    return clientsIds.length > 0;
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

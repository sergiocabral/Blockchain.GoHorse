import {
  HelperNumeric,
  NotReadyError,
  ShouldNeverHappenError
} from '@sergiocabral/helper';
import sha1 from 'sha1';

import { Bus } from './Bus';
import { BusDatabaseResult } from './BusDatabaseResult';
import { BusMessage } from '../BusMessage/BusMessage';
import { ConnectionState } from '@gohorse/npm-core';
import { IDatabase } from '@gohorse/npm-bus-database';

/**
 * Database especializado para o Core.
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
    tableChannel: 'channels',
    tableLock: 'locks',
    tableMessage: 'messages'
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
      throw new NotReadyError('The database connection is not open.');
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
  ): Promise<BusDatabaseResult> {
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
              ).format({ mask: 'universal' }),
              timestamp: new Date().getTime()
            }
          },
          undefined,
          ' '
        ),
        id: clientId
      }
    ]);
    await this.database.subscribe(clientId);

    return BusDatabaseResult.Success;
  }

  /**
   * Um cliente sai.
   */
  public async clientLeave(clientId: string): Promise<BusDatabaseResult> {
    await this.database.unsubscribe(clientId);
    await this.database.removeValues(this.DEFINITION.tableChannel, undefined, [
      clientId
    ]);
    await this.database.removeValues(this.DEFINITION.tableMessage, [clientId]);

    return BusDatabaseResult.Success;
  }

  /**
   * Um cliente notificou PING
   */
  public async clientPing(
    serverId: string,
    clientId: string,
    channelName: string
  ): Promise<BusDatabaseResult> {
    void (await this.database.touch(this.DEFINITION.tableChannel, [
      channelName
    ]));

    return BusDatabaseResult.Success;
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
      messages.map(message => message.id)
    );

    for (const message of messages) {
      await this.database.addHistory(
        this.DEFINITION.tableMessage,
        clientId,
        message.content
      );
    }

    return messages.map(message => message.content);
  }

  /**
   * Tenta fazer um bloqueio
   * @param lockId Identificador do lock.
   * @param clientId Identificador do cliente.
   * @param mode Ação
   * @returns Retorna o valor do lock.
   */
  public async lock(
    lockId: string,
    clientId: string,
    mode: boolean
  ): Promise<boolean> {
    return this.database.lock(
      this.DEFINITION.tableLock,
      lockId,
      clientId,
      mode
    );
  }

  /**
   * Posta uma mensagem do Core.
   * @param message Mensagem.
   * @returns Indica se alguém leu a mensagem.
   */
  public async postMessage(message: BusMessage): Promise<BusDatabaseResult> {
    if (!message.clientId) {
      throw new ShouldNeverHappenError();
    }

    return this.lockAndExecute(
      async () => {
        const clientsIds = (
          await this.database.getValues(
            this.DEFINITION.tableChannel,
            message.channels.includes(Bus.ALL_CHANNELS)
              ? undefined
              : message.channels
          )
        ).map(client => client.id);

        clientsIds.sort(() => HelperNumeric.between(-1, 1));

        for (const clientId of clientsIds) {
          await this.database.addValues(
            this.DEFINITION.tableMessage,
            clientId,
            [
              {
                content: JSON.stringify(message, undefined, ' '),
                id: message.id
              }
            ]
          );

          await this.database.notify(clientId);
        }

        return clientsIds.length > 0
          ? BusDatabaseResult.Success
          : BusDatabaseResult.Undelivered;
      },
      message.clientId,
      message.id
    );
  }

  /**
   * Handle: Notificação recebida em um canal.
   * @param channel Canal
   */
  private handleMessage(channel: string): void {
    this.onMessageReceived.forEach(onMessageReceived =>
      onMessageReceived(channel)
    );
  }

  /**
   * Realiza um lock de dados para um cliente e executa um bloco.
   * @param execute Executar durante o lock.
   * @param clientId Cliente.
   * @param data Dados.
   */
  private async lockAndExecute(
    execute: () => Promise<BusDatabaseResult>,
    clientId: string,
    ...data: unknown[]
  ): Promise<BusDatabaseResult> {
    const lockId = sha1(BusDatabase.name + JSON.stringify2(data, 0));

    let result: BusDatabaseResult;
    const acquired = await this.lock(lockId, clientId, true);
    if (acquired) {
      result = await execute();
      await this.lock(lockId, clientId, false);
    } else {
      result = BusDatabaseResult.AlreadyHandled;
    }

    return result;
  }
}
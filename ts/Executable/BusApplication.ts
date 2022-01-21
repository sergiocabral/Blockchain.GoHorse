import { Application, DomainBusMessages } from '@gohorse/npm-application';
import { BusServer, LockSynchronization } from '@gohorse/npm-bus';
import { IDatabase } from '@gohorse/npm-bus-database';
import { RedisDatabase } from '@gohorse/npm-bus-database-redis';
import { ConnectionState } from '@gohorse/npm-core';
import {
  ExchangeCoinMessage,
  UserMessageDeliveryReceipt
} from '@gohorse/npm-user-interaction';
import { WebSocketServer } from '@gohorse/npm-websocket';
import { Definition } from '../Definition';
import { BusConfiguration } from './BusConfiguration';

/**
 * Barramento de mensagens para comunicação entre as aplicações.
 */
export class BusApplication extends Application<BusConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = BusConfiguration;

  /**
   * Servidor do Bus.
   */
  private readonly busServer: BusServer;

  /**
   * Conexão com um banco de dados Redis
   */
  private readonly databaseServer: IDatabase;

  /**
   * Servidor WebSocket.
   */
  private readonly webSocketServer: WebSocketServer;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.databaseServer = new RedisDatabase(this.configuration.redis);
    this.webSocketServer = new WebSocketServer(this.configuration.messageBus);
    this.busServer = new BusServer(this.webSocketServer, this.databaseServer);
    DomainBusMessages.attach([ExchangeCoinMessage, UserMessageDeliveryReceipt]);
    LockSynchronization.database = this.busServer.database;
  }

  /**
   * Implementação da execução da aplicação..
   */
  protected async doRun(): Promise<void> {
    await this.databaseServer.open();
    await this.webSocketServer.open();
  }

  /**
   * Implementação da finalização da aplicação.
   */
  protected async doStop(): Promise<void> {
    if (this.webSocketServer.state !== ConnectionState.Closed) {
      await this.webSocketServer.close();
    }
    await this.closeDatabase();
  }

  /**
   * Finaliza a conexão com o banco de dados.
   * @param waitFor Tempo de espera antes de iniciar o fechamento da conexão.
   */
  private async closeDatabase(
    waitFor = Definition.ONE_SECOND_IN_MILLISECOND
  ): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(async () => {
        if (this.databaseServer.state !== ConnectionState.Closed) {
          await this.databaseServer.close();
        }
        resolve();
      }, waitFor);
    });
  }
}
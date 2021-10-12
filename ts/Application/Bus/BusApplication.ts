import { BusServer } from "../../Bus/BusServer";
import { Application } from "../../Core/Application";
import { IDatabase } from "../../Database/IDatabase";
import { RedisDatabase } from "../../Database/Redis/RedisDatabase";
import { WebSocketServer } from "../../WebSocket/WebSocketServer";

import { BusConfiguration } from "./BusConfiguration";

/**
 * Barramento de mensagens para comunicação entre as aplicações.
 */
export class BusApplication extends Application<BusConfiguration> {
  /**
   * Evento quando a aplicação for finalizada.
   */
  public readonly onStop: Set<() => void> = new Set<() => void>();

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
    this.databaseServer = new RedisDatabase(
      this.configuration.databaseRedisServer
    );
    this.webSocketServer = new WebSocketServer(
      this.configuration.webSocketServer
    );
    this.busServer = new BusServer(this.webSocketServer, this.databaseServer);
  }

  /**
   * Executa a aplicação.
   */
  public async run(): Promise<void> {
    await this.databaseServer.open();
    this.webSocketServer.open();
  }

  /**
   * Finaliza a aplicação.
   */
  public async stop(): Promise<void> {
    if (this.webSocketServer.opened) {
      await this.webSocketServer.close();
    }
    await this.closeDatabase();
  }

  /**
   * Finaliza a conexão com o banco de dados.
   * @param waitFor Tempo de espera antes de iniciar o fechamento da conexão.
   */
  private async closeDatabase(waitFor = 1000): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        if (this.databaseServer.opened) {
          await this.databaseServer.close();
        }

        this.onStop.forEach((onStop) => onStop());

        resolve();
      }, waitFor);
    });
  }
}

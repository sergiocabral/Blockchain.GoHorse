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
  public run(): void {
    this.databaseServer.open();
    this.webSocketServer.open();
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    if (this.webSocketServer.opened) {
      this.webSocketServer.close();
    }
    if (this.databaseServer.opened) {
      this.databaseServer.close();
    }
  }
}

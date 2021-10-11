import { Logger, Message } from "@sergiocabral/helper";

import { BusClient } from "../../Bus/BusClient";
import { BusMessageText } from "../../Bus/BusMessage/BusMessageText";
import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../WebSocket/WebSocketClient";

import { DatabaseConfiguration } from "./DatabaseConfiguration";

/**
 * Manipulador do banco de dados.
 */
export class DatabaseApplication extends Application<DatabaseConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = DatabaseConfiguration;

  /**
   * Enviador de mensagem via websocket.
   */
  private readonly busClient: BusClient;

  /**
   * Cliente websocket.
   */
  private readonly webSocketClient: WebSocketClient;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.webSocketClient = new WebSocketClient(
      this.configuration.messageBusWebSocketServer
    );
    this.busClient = new BusClient(this.webSocketClient, this.constructor.name);
    Message.subscribe(BusMessageText, (message) => Logger.post(message.text));
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketClient.start();
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    if (this.webSocketClient.opened) {
      this.webSocketClient.stop();
    }
  }
}

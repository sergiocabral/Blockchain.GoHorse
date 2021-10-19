import { Logger, Message } from "@sergiocabral/helper";

import { BusClient } from "../../Bus/BusClient";
import { BusMessageText } from "../../Bus/BusMessage/Communication/BusMessageText";
import { Application } from "../../Core/Application";
import { ConnectionState } from "../../Core/Connection/ConnectionState";
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
    this.webSocketClient = new WebSocketClient(this.configuration.messageBus);
    this.webSocketClient.onClose.add(this.stop.bind(this));
    this.busClient = new BusClient(this.webSocketClient, this.constructor.name);
    Message.subscribe(BusMessageText, (message) => Logger.post(message.text));
  }

  /**
   * Implementação da execução da aplicação..
   */
  protected async doRun(): Promise<void> {
    await this.webSocketClient.open();
  }

  /**
   * Implementação da finalização da aplicação.
   */
  protected async doStop(): Promise<void> {
    if (this.webSocketClient.state !== ConnectionState.Closed) {
      await this.webSocketClient.close();
    }
  }
}

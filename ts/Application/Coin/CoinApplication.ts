import { Logger, Message } from "@sergiocabral/helper";

import { BusClient } from "../../Bus/BusClient";
import { BusMessageText } from "../../Bus/BusMessage/BusMessageText";
import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../WebSocket/WebSocketClient";

import { CoinConfiguration } from "./CoinConfiguration";

/**
 * Manipulador da criptomoeda.
 */
export class CoinApplication extends Application<CoinConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = CoinConfiguration;

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

import { Logger, Message } from "@sergiocabral/helper";

import { BusClient } from "../../Bus/BusClient";
import { BusMessageText } from "../../Bus/BusMessage/Communication/BusMessageText";
import { CoinCommandHandler } from "../../Coin/CoinCommandHandler";
import { Application } from "../../Core/Application";
import { ConnectionState } from "../../Core/Connection/ConnectionState";
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
   * Trata a captura de comandos relacionados a criptomoeda
   */
  private coinCommandHandler: CoinCommandHandler;

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
    this.coinCommandHandler = new CoinCommandHandler();
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

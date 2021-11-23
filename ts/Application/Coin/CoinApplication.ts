import { Logger, Message } from "@sergiocabral/helper";

import { BusMessageText } from "../../Bus/BusMessage/Communication/BusMessageText";
import { BusChannel } from "../../Business/Bus/BusChannel";
import { BusConnection } from "../../Business/Bus/BusConnection";
import { CoinCommandHandler } from "../../Coin/CoinCommandHandler";
import { Application } from "../../Core/Application";
import { ConnectionState } from "../../Core/Connection/ConnectionState";

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
   * Conexão com o bus de comunicação entre as aplicações.
   */
  private readonly busConnection: BusConnection;

  /**
   * Trata a captura de comandos relacionados a criptomoeda
   */
  private readonly coinCommandHandler: CoinCommandHandler;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.busConnection = new BusConnection(
      this.configuration.messageBus,
      BusChannel.Coin
    );
    this.coinCommandHandler = new CoinCommandHandler();
    Message.subscribe(BusMessageText, (message) => Logger.post(message.text));
  }

  /**
   * Implementação da execução da aplicação..
   */
  protected async doRun(): Promise<void> {
    await this.busConnection.open();
  }

  /**
   * Implementação da finalização da aplicação.
   */
  protected async doStop(): Promise<void> {
    if (this.busConnection.state !== ConnectionState.Closed) {
      await this.busConnection.close();
    }
  }
}

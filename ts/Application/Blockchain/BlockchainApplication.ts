import { Logger, Message } from "@sergiocabral/helper";

import { BusMessageText } from "../../Bus/BusMessage/Communication/BusMessageText";
import { BusChannel } from "../../Business/Bus/BusChannel";
import { BusConnection } from "../../Business/Bus/BusConnection";
import { CreateBusMessage } from "../../Business/Bus/CreateBusMessage";
import { Application } from "../../Core/Application";
import { ConnectionState } from "../../Core/Connection/ConnectionState";

import { BlockchainConfiguration } from "./BlockchainConfiguration";

/**
 * Blockchain.
 */
export class BlockchainApplication extends Application<BlockchainConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = BlockchainConfiguration;

  /**
   * Conexão com o bus de comunicação entre as aplicações.
   */
  private readonly busConnection: BusConnection;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.busConnection = new BusConnection(
      this.configuration.messageBus,
      BusChannel.Blockchain,
      new CreateBusMessage()
    );
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

import { Logger, Message } from "@sergiocabral/helper";

import { BusMessageText } from "../../../Bus/BusMessage/Communication/BusMessageText";
import { Application } from "../../../Core/Application/Application";
import { ConnectionState } from "../../../Core/Connection/ConnectionState";
import { BusChannel } from "../../Bus/BusChannel";
import { BusConnection } from "../../Bus/BusConnection";

import { MinerConfiguration } from "./MinerConfiguration";

/**
 * Minerador.
 */
export class MinerApplication extends Application<MinerConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = MinerConfiguration;

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
      BusChannel.Miner,
      this.configuration.pingToServerInSeconds
    );
    Message.subscribe(BusMessageText, (message) => Logger.post(message.text));
  }

  /**
   * Implementação da execução da aplicação.
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

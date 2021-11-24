import { Logger, Message } from "@sergiocabral/helper";

import { BusMessageText } from "../../Bus/BusMessage/Communication/BusMessageText";
import { BusChannel } from "../../Business/Bus/BusChannel";
import { BusConnection } from "../../Business/Bus/BusConnection";
import { CreateBusMessage } from "../../Business/Bus/CreateBusMessage";
import { Application } from "../../Core/Application";
import { ConnectionState } from "../../Core/Connection/ConnectionState";

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
      BusChannel.Database,
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

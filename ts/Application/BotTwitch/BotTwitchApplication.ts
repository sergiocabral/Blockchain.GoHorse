import { HelperObject, Logger, Message } from "@sergiocabral/helper";

import { ALL_CHANNELS } from "../../Bus/AllChannels";
import { BusMessageText } from "../../Bus/BusMessage/BusMessageText";
import { BusMessageClient } from "../../Bus/BusMessageClient";
import { BusMessageReceived } from "../../Bus/Message/BusMessageReceived";
import { BusMessageSend } from "../../Bus/Message/BusMessageSend";
import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../WebSocket/WebSockerClient";

import { BotTwitchConfiguration } from "./BotTwitchConfiguration";

/**
 * Bot que ouve comandos no chat da Twitch.
 */
export class BotTwitchApplication extends Application<BotTwitchConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = BotTwitchConfiguration;

  /**
   * Enviador de mensagem via websocket.
   */
  private readonly busMessageClient: BusMessageClient;

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
    this.busMessageClient = new BusMessageClient(this.webSocketClient, [
      "user-bot",
    ]);
    Message.subscribe(
      BusMessageReceived,
      this.handleBusMessageReceived.bind(this)
    );
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketClient.start();

    const interval = 60000;
    setInterval(() => {
      void new BusMessageSend(
        this.busMessageClient,
        new BusMessageText(
          ["CoinApplication", "MinerApplication", "Nothing"],
          "Hello Coin"
        )
      ).sendAsync();
      void new BusMessageSend(
        this.busMessageClient,
        new BusMessageText(ALL_CHANNELS, "Hello World")
      ).sendAsync();
    }, interval);
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    if (this.webSocketClient.started) {
      this.webSocketClient.stop();
    }
  }

  /**
   * Mensagem: BusMessageReceived
   */
  private handleBusMessageReceived(message: BusMessageReceived): void {
    Logger.post(HelperObject.toText(message.busMessage));
  }
}

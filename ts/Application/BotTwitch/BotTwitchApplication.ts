import { HelperObject, Logger, Message } from "@sergiocabral/helper";

import { BusClient } from "../../Bus/BusClient";
import { BusMessageText } from "../../Bus/BusMessage/BusMessageText";
import { BusReceived } from "../../Bus/Message/BusReceived";
import { BusSend } from "../../Bus/Message/BusSend";
import { BusSubscribeChannels } from "../../Bus/Message/BusSubscribeChannels";
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
  private readonly busMessageClient: BusClient;

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
    this.busMessageClient = new BusClient(this.webSocketClient);
    Message.subscribe(BusReceived, this.handleBusMessageReceived.bind(this));

    void new BusSubscribeChannels(
      this.busMessageClient,
      "user-bot"
    ).sendAsync();
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketClient.start();

    const interval = 60000;
    setInterval(() => {
      void new BusSend(
        this.busMessageClient,
        new BusMessageText("Hello Coin", [
          "CoinApplication",
          "MinerApplication",
          "Nothing",
        ])
      ).sendAsync();
      void new BusSend(
        this.busMessageClient,
        new BusMessageText("Hello World")
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
  private handleBusMessageReceived(message: BusReceived): void {
    Logger.post(HelperObject.toText(message.busMessage));
  }
}

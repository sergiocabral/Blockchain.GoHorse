import { HelperObject, Logger } from "@sergiocabral/helper";

import { ALL_CHANNELS } from "../../Bus/AllChannels";
import { BusMessageText } from "../../Bus/BusMessage/BusMessageText";
import { IBusMessage } from "../../Bus/BusMessage/IBusMessage";
import { BusMessageClient } from "../../Bus/BusMessageClient";
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
    this.busMessageClient = new BusMessageClient(
      this.webSocketClient,
      ["user-bot"],
      this.busMessageHandler.bind(this)
    );
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketClient.start();

    const interval = 60000;
    setInterval(() => {
      this.busMessageClient.send(
        new BusMessageText(
          ["CoinApplication", "MinerApplication", "Nothing"],
          "Hello Coin"
        )
      );
      this.busMessageClient.send(
        new BusMessageText(ALL_CHANNELS, "Hello World")
      );
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
   * Ao receber uma mensagem do Bus.
   */
  private busMessageHandler(busMessage: IBusMessage): void {
    Logger.post(HelperObject.toText(busMessage));
  }
}

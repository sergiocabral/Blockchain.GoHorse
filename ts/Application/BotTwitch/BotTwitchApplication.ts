import { Logger, Message } from "@sergiocabral/helper";
import { clearInterval } from "timers";

import { BusClient } from "../../Bus/BusClient";
import { BusMessageText } from "../../Bus/BusMessage/BusMessageText";
import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../WebSocket/WebSocketClient";

import { BotTwitchConfiguration } from "./BotTwitchConfiguration";

/**
 * Bot que ouve comandos no chat da Twitch.
 */
export class BotTwitchApplication extends Application<BotTwitchConfiguration> {
  /**
   * Evento quando a aplicação for finalizada.
   */
  public readonly onStop: Set<() => void> = new Set<() => void>();

  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = BotTwitchConfiguration;

  /**
   * Cliente de acesso ao Bus.
   */
  private readonly busClient: BusClient;

  /**
   * Timer.
   */
  private timeout: NodeJS.Timer = 0 as unknown as NodeJS.Timer;

  /**
   * Cliente WebSocket.
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
    this.webSocketClient.onClose.add(this.stop.bind(this));
    this.busClient = new BusClient(this.webSocketClient, this.constructor.name);
    Message.subscribe(BusMessageText, (message) => Logger.post(message.text));
  }

  /**
   * Executa a aplicação.
   */
  public async run(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.webSocketClient.open();

      const interval = 10000;
      this.timeout = setInterval(() => {
        Logger.post('Sending "Hello Coin" to CoinApplication.');
        this.busClient.send(
          new BusMessageText("Hello Coin", ["CoinApplication", "Nothing"])
        );

        Logger.post('Sending "Hello World" to all applications.');
        this.busClient.send(new BusMessageText("Hello World"));
      }, interval);

      resolve();
    });
  }

  /**
   * Finaliza a aplicação.
   */
  public async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.webSocketClient.opened) {
        this.webSocketClient.close();
      }
      clearInterval(this.timeout);

      this.onStop.forEach((onStop) => onStop());

      resolve();
    });
  }
}

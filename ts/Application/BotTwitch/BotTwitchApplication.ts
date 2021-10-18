import { BusClient } from "../../Bus/BusClient";
import { Application } from "../../Core/Application";
import { ConnectionState } from "../../Core/Connection/ConnectionState";
import { TwitchChatClient } from "../../Twitch/Chat/TwitchChatClient";
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
   * Sinaliza que a aplicação já foi parada.
   */
  private stopped = false;

  /**
   * Cliente do IRC Chat
   */
  private readonly twitchChatClient: TwitchChatClient;

  /**
   * Cliente WebSocket.
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
    this.twitchChatClient = new TwitchChatClient(this.configuration.twitchChat);
  }

  /**
   * Executa a aplicação.
   */
  public async run(): Promise<void> {
    await this.webSocketClient.open();
    await this.twitchChatClient.open();
  }

  /**
   * Finaliza a aplicação.
   */
  public async stop(): Promise<void> {
    if (this.stopped) {
      return;
    }
    this.stopped = true;

    if (this.twitchChatClient.state !== ConnectionState.Closed) {
      await this.twitchChatClient.close();
    }

    if (this.webSocketClient.state !== ConnectionState.Closed) {
      await this.webSocketClient.close();
    }

    this.onStop.forEach((onStop) => onStop());
  }
}

import { BusClient } from "../../Bus/BusClient";
import { Application } from "../../Core/Application";
import { IrcChatClient } from "../../Twitch/IrcChat/IrcChatClient";
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
   * Cliente do IRC Chat
   */
  private readonly ircChatClient: IrcChatClient;

  /**
   * Sinaliza que a aplicação já foi parada.
   * @private
   */
  private stopped = false;

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
    this.ircChatClient = new IrcChatClient(this.configuration.ircChatServer);
  }

  /**
   * Executa a aplicação.
   */
  public async run(): Promise<void> {
    await this.webSocketClient.open();
    await this.ircChatClient.open();
  }

  /**
   * Finaliza a aplicação.
   */
  public async stop(): Promise<void> {
    if (this.stopped) {
      return;
    }
    this.stopped = true;

    if (this.ircChatClient.opened) {
      await this.ircChatClient.close();
    }

    if (this.webSocketClient.opened) {
      await this.webSocketClient.close();
    }

    this.onStop.forEach((onStop) => onStop());
  }
}

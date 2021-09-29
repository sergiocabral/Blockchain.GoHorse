import { clearInterval } from "timers";

import { Application } from "../../Core/Application";
import { WebSocketClientMessageSend } from "../../WebSocket/Message/WebSocketClientMessageSend";
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
   * Controlador do temporizador.
   */
  private interval: NodeJS.Timer = 0 as unknown as NodeJS.Timer;

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
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketClient.start();
    const interval = 5000;
    this.interval = setInterval(
      () =>
        new WebSocketClientMessageSend(
          this.webSocketClient,
          "PING: {0}".querystring(new Date().format())
        ).sendAsync(),
      interval
    );
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    clearInterval(this.interval);
    if (this.webSocketClient.started) {
      this.webSocketClient.stop();
    }
  }
}

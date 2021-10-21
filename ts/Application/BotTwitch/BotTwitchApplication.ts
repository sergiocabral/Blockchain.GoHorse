import { Message } from "@sergiocabral/helper";

import { BusClient } from "../../Bus/BusClient";
import { Application } from "../../Core/Application";
import { ConnectionState } from "../../Core/Connection/ConnectionState";
import { TwitchChatMessage } from "../../ExternalService/Twitch/Chat/Message/TwitchChatMessage";
import { TwitchChatRedeem } from "../../ExternalService/Twitch/Chat/Message/TwitchChatRedeem";
import { TwitchChatClient } from "../../ExternalService/Twitch/Chat/TwitchChatClient";
import { TwitchHelper } from "../../ExternalService/Twitch/TwitchHelper";
import { UserMessageReceived } from "../../UserInteraction/Message/UserMessageReceived";
import { UserInteraction } from "../../UserInteraction/UserInteraction";
import { WebSocketClient } from "../../WebSocket/WebSocketClient";

import { BotTwitchConfiguration } from "./BotTwitchConfiguration";

/**
 * Bot que ouve comandos no chat da Twitch.
 */
export class BotTwitchApplication extends Application<BotTwitchConfiguration> {
  // TODO: Consumir Twitch via api (ao invés? ou adicionalmente?) de chat

  /**
   * Handle: TwitchChatMessage | TwitchChatRedeem
   */
  private static handleTwitchMessage(
    message: TwitchChatMessage | TwitchChatRedeem
  ): void {
    // TODO: Resgate de Cabr0n Coin: 6960fa6f-e820-4b56-8ae0-83ba748fa7d8
    const fromPlatform = message instanceof TwitchChatRedeem;
    const user = TwitchHelper.createUserModel(message.userstate);
    void new UserMessageReceived(message.message, user, fromPlatform).send();
  }

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
   * Tratamento da interação com o usuário.
   */
  private readonly userInteraction: UserInteraction;

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
    this.twitchChatClient = new TwitchChatClient(
      this.configuration.twitchChat,
      {
        list: ["chat", "redeem"],
        mode: "include",
      }
    );
    this.userInteraction = new UserInteraction();

    Message.subscribe(TwitchChatMessage, (message) =>
      BotTwitchApplication.handleTwitchMessage(message)
    );
    Message.subscribe(TwitchChatRedeem, (message) =>
      BotTwitchApplication.handleTwitchMessage(message)
    );
  }

  /**
   * Implementação da execução da aplicação..
   */
  protected async doRun(): Promise<void> {
    await this.webSocketClient.open();
    await this.twitchChatClient.open();
  }

  /**
   * Implementação da finalização da aplicação.
   */
  protected async doStop(): Promise<void> {
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
  }
}

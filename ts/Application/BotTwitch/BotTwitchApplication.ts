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
    this.busClient = new BusClient(this.webSocketClient, this.constructor.name); // TODO: Usar como nome de canal outra coisa que não seja o nome da classe para remover acoplamento.
    this.twitchChatClient = new TwitchChatClient(
      this.configuration.twitchChat,
      {
        list: ["chat", "redeem"],
        mode: "include",
      }
    );
    this.userInteraction = new UserInteraction(this.busClient);

    Message.subscribe(TwitchChatMessage, (message) =>
      this.handleTwitchMessage(message)
    );
    Message.subscribe(TwitchChatRedeem, (message) =>
      this.handleTwitchMessage(message)
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

  /**
   * Tenta extrair de uma mensagem um comando válido.
   * @param message Mensagem original.
   */
  private extractPlatformCommand(
    message: TwitchChatMessage | TwitchChatRedeem
  ): string | undefined {
    if (
      message instanceof TwitchChatRedeem &&
      message.rewardType ===
        this.configuration.exchangeTwitchForCabr0nCoinRedeemId
    ) {
      const price = this.configuration.exchangeTwitchForCabr0nCoinPrice;
      const amount = this.configuration.exchangeTwitchForCabr0nCoinAmount;
      const escapedMessage = JSON.stringify(message.message);

      return `exchange --from Twitch --destination Cabr0nCoin --price ${price} --amount ${amount} --message ${escapedMessage}`;
    }

    return undefined;
  }

  /**
   * Tenta extrair um comando do usuário.
   * @param message Mensagem original.
   */
  private extractUserCommand(
    message: TwitchChatMessage | TwitchChatRedeem
  ): string | undefined {
    if (message instanceof TwitchChatMessage) {
      const userMessage = message.message.toLowerCase().trim();
      const commandPrefix = this.configuration.commandPrefix.find((prefix) =>
        userMessage.startsWith(`${prefix} `.toLowerCase())
      );
      if (commandPrefix !== undefined) {
        return message.message.substr(commandPrefix.length).trim();
      }
    }

    return undefined;
  }

  /**
   * Handle: TwitchChatMessage | TwitchChatRedeem
   */
  private handleTwitchMessage(
    message: TwitchChatMessage | TwitchChatRedeem
  ): void {
    const platformCommand = this.extractPlatformCommand(message);
    const fromPlatform = platformCommand !== undefined;
    const userCommand = fromPlatform
      ? platformCommand
      : this.extractUserCommand(message);

    if (userCommand !== undefined) {
      const user = TwitchHelper.createUserModel(message.userstate);
      void new UserMessageReceived(userCommand, user, fromPlatform).send();
    }
  }
}

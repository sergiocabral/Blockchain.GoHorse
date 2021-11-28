import {
  HashJson,
  Logger,
  LogLevel,
  Message,
  NotImplementedError,
} from "@sergiocabral/helper";

import { Application } from "../../../Core/Application/Application";
import { ConnectionState } from "../../../Core/Connection/ConnectionState";
import { SendTwitchChatMessage } from "../../../ExternalService/Twitch/Chat/Message/SendTwitchChatMessage";
import { TwitchChatMessage } from "../../../ExternalService/Twitch/Chat/Message/TwitchChatMessage";
import { TwitchChatRedeem } from "../../../ExternalService/Twitch/Chat/Message/TwitchChatRedeem";
import { TwitchChatClient } from "../../../ExternalService/Twitch/Chat/TwitchChatClient";
import { TwitchHelper } from "../../../ExternalService/Twitch/TwitchHelper";
import { Lock } from "../../../Lock/Message/Lock";
import { UserMessageRejected } from "../../../UserInteraction/BusMessage/UserMessageRejected";
import { UserMessageReceived } from "../../../UserInteraction/Message/UserMessageReceived";
import { RejectReason } from "../../../UserInteraction/RejectReason";
import { UserInteraction } from "../../../UserInteraction/UserInteraction";
import { BusChannel } from "../../Bus/BusChannel";
import { BusConnection } from "../../Bus/BusConnection";

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
   * Conexão com o bus de comunicação entre as aplicações.
   */
  private readonly busConnection: BusConnection;

  /**
   * Sinaliza que a aplicação já foi parada.
   */
  private stopped = false;

  /**
   * Cliente do IRC Chat
   */
  private readonly twitchChatClient: TwitchChatClient;

  /**
   * Histórico de mensagens enviadas.
   */
  private readonly twitchMessages: HashJson<
    TwitchChatMessage | TwitchChatRedeem
  >;

  /**
   * Tratamento da interação com o usuário.
   */
  private readonly userInteraction: UserInteraction;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.busConnection = new BusConnection(
      this.configuration.messageBus,
      BusChannel.UserInteraction
    );
    this.busConnection.onClose.add(this.stop.bind(this));
    this.twitchChatClient = new TwitchChatClient(
      this.configuration.twitchChat,
      {
        list: ["chat", "redeem"],
        mode: "include",
      }
    );
    this.userInteraction = new UserInteraction();

    const oneMinute = 60000;
    this.twitchMessages = new HashJson<TwitchChatMessage | TwitchChatRedeem>(
      oneMinute
    );

    Message.subscribe(TwitchChatMessage, (message) =>
      this.handleTwitchMessage(message)
    );
    Message.subscribe(TwitchChatRedeem, (message) =>
      this.handleTwitchMessage(message)
    );
    Message.subscribe(
      UserMessageRejected,
      this.handleUserMessageRejected.bind(this)
    );
  }

  /**
   * Implementação da execução da aplicação..
   */
  protected async doRun(): Promise<void> {
    await this.busConnection.open();
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

    if (this.busConnection.state !== ConnectionState.Closed) {
      await this.busConnection.close();
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
    const userMessage = message.message.toLowerCase().trim();
    const commandPrefix = this.configuration.commandPrefix.find((prefix) =>
      userMessage.startsWith(`${prefix} `.toLowerCase())
    );
    if (commandPrefix !== undefined) {
      return message.message.substring(commandPrefix.length).trim();
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
      const userMessageReceived = new UserMessageReceived(
        message.id,
        userCommand,
        user,
        fromPlatform
      );
      userMessageReceived.send();
      this.twitchMessages.set(userMessageReceived, message);
    }
  }

  /**
   * Handle: UserMessageRejected
   */
  private async handleUserMessageRejected(
    message: UserMessageRejected
  ): Promise<void> {
    const originalMessage = this.twitchMessages.get(message.message);
    if (!originalMessage) {
      return;
    }

    if (message.messageType === UserMessageReceived.name) {
      let text: string;
      switch (message.reason) {
        case RejectReason.Invalid:
          text = "@{username}, you sent an invalid command: {invalidCommand}"
            .translate()
            .querystring({
              invalidCommand: originalMessage.message,
              username: originalMessage.username,
            });
          break;
        case RejectReason.Undelivered:
          text =
            "@{username}, please try later because the system does not seem to be online. Your command was not processed: {command}"
              .translate()
              .querystring({
                command: originalMessage.message,
                username: originalMessage.username,
              });
          break;
        default:
          throw new NotImplementedError(
            `The reject reason "${message.reason}" was not implemented.`
          );
      }

      const twitchMessageId = (message.message as TwitchChatMessage | undefined)
        ?.id;

      if (twitchMessageId === undefined) {
        throw new NotImplementedError("The Twitch message id was not found.");
      }

      Logger.post(
        'User message "{twitchMessageId}" rejected: {text}',
        {
          text,
          twitchMessageId,
        },
        LogLevel.Verbose,
        BotTwitchApplication.name
      );

      await new Lock()
        .with(twitchMessageId)
        .execute(() => this.sendMessage(text, originalMessage.channel))
        .sendAsync();
    }
  }

  /**
   * Enviar uma mensagem para a Twitch.
   * @param message Mensagem
   * @param channels Canais.
   */
  private sendMessage(message: string, ...channels: string[]): void {
    if (this.configuration.messageSignature) {
      const clientId = this.busConnection.clientId;
      const fields: Record<string, unknown> = {
        id: clientId,
      };
      for (let i = 1; i <= clientId.length; i += 1) {
        fields[`id:${i}`] = clientId.substring(0, i);
      }
      const signature = this.configuration.messageSignature
        ?.querystring(fields)
        .trim();
      if (signature) {
        message = `${message.trim()} — ${signature}`;
      }
    }
    channels.forEach((channel) =>
      new SendTwitchChatMessage(channel, message).send()
    );
  }
}

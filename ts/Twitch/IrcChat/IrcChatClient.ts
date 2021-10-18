import { Logger, LogLevel } from "@sergiocabral/helper";
import { Client } from "tmi.js";

import { IrcChatClientConfiguration } from "./IrcChatClientConfiguration";

/**
 * Cliente IRC para o chat da Twitch.
 */
export class IrcChatClient {
  /**
   * Cliente com o IRC
   */
  private readonly ircClient: Client;

  /**
   * Construtor.
   * @param configuration Configurações.
   */
  public constructor(
    private readonly configuration: IrcChatClientConfiguration
  ) {
    this.ircClient = new Client({
      connection: {
        maxReconnectAttempts: Number.MAX_SAFE_INTEGER,
        maxReconnectInterval: 300000,
        port: configuration.port,
        reconnect: configuration.reconnect,
        reconnectDecay: 2,
        reconnectInterval: 500,
        secure: configuration.secure,
        server: configuration.server,
      } as unknown as undefined,
      identity: {
        password: configuration.authentication.token,
        username: configuration.authentication.username,
      },
      logger: {
        debug: (message: string) =>
          Logger.post(message, undefined, LogLevel.Verbose, "tmi.js"),
        error: (message: string) =>
          Logger.post(message, undefined, LogLevel.Error, "tmi.js"),
        info: (message: string) =>
          Logger.post(message, undefined, LogLevel.Debug, "tmi.js"),
        warn: (message: string) =>
          Logger.post(message, undefined, LogLevel.Warning, "tmi.js"),
      } as unknown as undefined,
      options: {
        debug: true,
        messagesLogLevel: "debug",
        skipMembership: true,
        skipUpdatingEmotesets: true,
        updateEmotesetsTimer: 0,
      },
    });
  }

  /**
   * Finaliza a conexão com servidor IRC.
   */
  public async close(): Promise<void> {
    await this.ircClient.disconnect();
  }

  /**
   * Estabelece a conexão conexão com servidor IRC.
   */
  public async open(): Promise<void> {
    try {
      const result = await this.ircClient.connect();
      Logger.post(
        'Established connection to IRC Chat with code {code} and status "{status}".',
        {
          code: result[1],
          status: result[0],
        },
        LogLevel.Information,
        IrcChatClient.name
      );
    } catch (error: unknown) {
      Logger.post(
        'Error while connecting to IRC Chat: {error}',
        {
          error: error instanceof Error ? error.message : String(error),
        },
        LogLevel.Error,
        IrcChatClient.name
      );
    }
  }
}

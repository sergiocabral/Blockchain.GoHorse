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
        maxReconnectAttempts: 10,
        maxReconnectInverval: 60,
        port: configuration.port,
        reconnect: true,
        reconnectDecay: 1.5,
        reconnectInterval: 5,
        secure: configuration.secure,
        server: configuration.server,
      },
      identity: {
        password: configuration.authentication.token,
        username: configuration.authentication.user,
      },
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
    return new Promise((resolve) => resolve());
  }

  /**
   * Estabelece a conexão conexão com servidor IRC.
   */
  public async open(): Promise<void> {
    return new Promise((resolve) => resolve());
  }
}

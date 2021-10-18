import { InvalidExecutionError, Logger, LogLevel } from "@sergiocabral/helper";
import { Client, Options } from "tmi.js";

import { IConnection } from "../../Core/IConnection";

import { IrcChatClientConfiguration } from "./IrcChatClientConfiguration";

/**
 * Cliente IRC para o chat da Twitch.
 */
export class IrcChatClient implements IConnection {
  /**
   * Cliente IRC
   */
  private clientValue?: Client;

  /**
   * Construtor.
   * @param configuration Configurações.
   */
  public constructor(
    private readonly configuration: IrcChatClientConfiguration
  ) {}

  /**
   * Sinaliza que a conexão está aberta.
   */
  public get opened(): boolean {
    return this.clientValue !== undefined;
  }

  /**
   * Cliente IRC.
   */
  private get client(): Client {
    if (this.clientValue === undefined) {
      throw new InvalidExecutionError("IRC client is not opened.");
    }

    return this.clientValue;
  }

  /**
   * Cliente IRC.
   */
  private set client(value: Client | undefined) {
    if (this.clientValue !== undefined && value !== undefined) {
      throw new InvalidExecutionError("IRC client already opened.");
    }
    this.clientValue = value;
  }

  /**
   * Finaliza a conexão com servidor IRC.
   */
  public async close(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Estabelece a conexão conexão com servidor IRC.
   */
  public async open(): Promise<void> {
    try {
      this.client = new Client(this.factoryClientOptions());
      const result = await this.client.connect();
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
        "Error while connecting to IRC Chat: {error}",
        {
          error: error instanceof Error ? error.message : String(error),
        },
        LogLevel.Error,
        IrcChatClient.name
      );
    }
  }

  /**
   * Monta as configurações de conexão do cliente.
   */
  private factoryClientOptions(): Options {
    return {
      connection: {
        maxReconnectAttempts: Number.MAX_SAFE_INTEGER,
        maxReconnectInterval: 300000,
        port: this.configuration.port,
        reconnect: this.configuration.reconnect,
        reconnectDecay: 2,
        reconnectInterval: 500,
        secure: this.configuration.secure,
        server: this.configuration.server,
      } as unknown as undefined,
      identity: {
        password: this.configuration.authentication.token,
        username: this.configuration.authentication.username,
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
    };
  }
}

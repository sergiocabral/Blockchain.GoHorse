import {
  HelperObject,
  InvalidExecutionError,
  Logger,
  LogLevel,
  NetworkError,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";
import { Client, Options } from "tmi.js";

import { ConnectionState } from "../../Core/Connection/ConnectionState";
import { IConnection } from "../../Core/Connection/IConnection";

import { TwitchChatClientConfiguration } from "./TwitchChatClientConfiguration";
import { TwitchChatEvents } from "./TwitchChatEvents";

/**
 * Cliente IRC para o chat da Twitch.
 */
export class TwitchChatClient implements IConnection {
  /**
   * Lista de eventos associados ao cliente.
   */
  private clientEvents?: Map<string, boolean>;

  /**
   * Cliente IRC
   */
  private clientValue?: Client;

  /**
   * Construtor.
   * @param configuration Configurações.
   */
  public constructor(
    private readonly configuration: TwitchChatClientConfiguration
  ) {}

  /**
   * Estado da conexão.
   */
  public get state(): ConnectionState {
    if (this.clientValue?.readyState() === "OPEN") {
      return ConnectionState.Ready;
    }

    if (this.clientValue !== undefined) {
      return ConnectionState.Connecting;
    }

    return ConnectionState.Closed;
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

    if (this.clientEvents === undefined) {
      throw new ShouldNeverHappenError();
    }

    this.clientEvents.clear();
  }

  /**
   * Estabelece a conexão conexão com servidor IRC.
   */
  public async open(): Promise<void> {
    this.client = new Client(this.factoryClientOptions());

    try {
      const clientReconnectOriginalValue = HelperObject.getProperty<boolean>(
        this.client,
        "reconnect"
      );
      HelperObject.setProperty(this.client, "reconnect", false);

      const result = await this.client.connect();

      this.clientEvents = TwitchChatEvents.register(
        this.client,
        new TwitchChatEvents()
      );

      HelperObject.setProperty(
        this.client,
        "reconnect",
        clientReconnectOriginalValue
      );

      Logger.post(
        "Established connection to IRC chat on server {protocol}://{server}:{port}",
        {
          port: result[1],
          protocol: this.configuration.protocol,
          server: result[0],
        },
        LogLevel.Information,
        TwitchChatClient.name
      );
    } catch (error: unknown) {
      this.client = undefined;
      throw new NetworkError(
        "Error while connecting to IRC Chat: {0}".querystring(
          error instanceof Error ? error.message : String(error)
        ),
        error
      );
    }
  }

  /**
   * Monta as configurações de conexão do cliente.
   */
  private factoryClientOptions(
    onEvent?: (message: string, level: LogLevel) => void
  ): Options {
    const logger = (message: string, level: LogLevel) => {
      Logger.post(message, undefined, level, "tmi.js");
      if (onEvent) {
        onEvent(message, level);
      }
    };

    return {
      channels: ["sergiocabral_com"],
      connection: {
        maxReconnectAttempts: 2,
        maxReconnectInterval: 300000,
        port: this.configuration.port,
        reconnect: this.configuration.tryReconnectWhenDisconnect,
        reconnectDecay: 2,
        reconnectInterval: 500,
        secure: this.configuration.protocol === "wss",
        server: this.configuration.server,
      } as unknown as undefined,
      identity: {
        password: this.configuration.twitchAuthentication.token,
        username: this.configuration.twitchAuthentication.username,
      },
      logger: {
        debug: (message: string) => logger(message, LogLevel.Verbose),
        error: (message: string) => logger(message, LogLevel.Error),
        info: (message: string) => logger(message, LogLevel.Debug),
        warn: (message: string) => logger(message, LogLevel.Warning),
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

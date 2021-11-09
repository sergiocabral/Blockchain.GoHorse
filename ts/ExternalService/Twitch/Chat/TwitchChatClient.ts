import {
  HelperObject,
  InvalidExecutionError,
  Logger,
  LogLevel,
  Message,
  NetworkError,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";
import { Client, Events, Options } from "tmi.js";

import { ConnectionState } from "../../../Core/Connection/ConnectionState";
import { IConnection } from "../../../Core/Connection/IConnection";

import { SendTwitchChatMessage } from "./Message/SendTwitchChatMessage";
import { TwitchChatClientConfiguration } from "./TwitchChatClientConfiguration";
import { TwitchChatEvents } from "./TwitchChatEvents";

/**
 * Cliente para o chat da Twitch.
 */
export class TwitchChatClient implements IConnection {
  /**
   * Lista de eventos associados ao cliente.
   */
  private clientEvents?: Map<string, boolean>;

  /**
   * Cliente
   */
  private clientValue?: Client;

  /**
   * Construtor.
   * @param configuration Configurações.
   * @param eventFilter Filtragem de eventos.
   */
  public constructor(
    private readonly configuration: TwitchChatClientConfiguration,
    private readonly eventFilter?: {
      /**
       * Lista de eventos.
       */
      list: Array<keyof Events>;

      /**
       * Filtragem de inclusão ou negação.
       */
      mode: "include" | "exclude";
    }
  ) {
    Message.subscribe(
      SendTwitchChatMessage,
      this.handleSendTwitchChatMessage.bind(this)
    );
  }

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
   * Cliente.
   */
  private get client(): Client {
    if (this.clientValue === undefined) {
      throw new InvalidExecutionError("Client is not opened.");
    }

    return this.clientValue;
  }

  /**
   * Cliente.
   */
  private set client(value: Client | undefined) {
    if (this.clientValue !== undefined && value !== undefined) {
      throw new InvalidExecutionError("Client already opened.");
    }
    this.clientValue = value;
  }

  /**
   * Finaliza a conexão com servidor.
   */
  public async close(): Promise<void> {
    await this.client.disconnect();

    if (this.clientEvents === undefined) {
      throw new ShouldNeverHappenError();
    }

    this.clientEvents.clear();
  }

  /**
   * Estabelece a conexão conexão com servidor.
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

      this.clientEvents = this.applyEventFilter(this.client);

      HelperObject.setProperty(
        this.client,
        "reconnect",
        clientReconnectOriginalValue
      );

      Logger.post(
        "Established connection to chat on server {protocol}://{server}:{port}",
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
        "Error while connecting to chat: {0}".querystring(
          error instanceof Error ? error.message : String(error)
        ),
        error
      );
    }
  }

  /**
   * Aplica o filtro na captura de eventos.
   * @param client Cliente
   */
  private applyEventFilter(client: Client): Map<string, boolean> {
    const events = TwitchChatEvents.register(client, new TwitchChatEvents());

    if (this.eventFilter !== undefined) {
      for (const entry of events) {
        const event = entry[0];
        const contaisInFilter = this.eventFilter.list.includes(event);
        const enabled =
          (this.eventFilter.mode === "include" && contaisInFilter) ||
          (this.eventFilter.mode === "exclude" && !contaisInFilter);
        events.set(event, enabled);
      }
    }

    return events;
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
      channels: this.configuration.channels,
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

  /**
   * Handle: SendTwitchChatMessage
   */
  private async handleSendTwitchChatMessage(
    message: SendTwitchChatMessage
  ): Promise<void> {
    await this.client.say(message.channel, message.message);
  }
}

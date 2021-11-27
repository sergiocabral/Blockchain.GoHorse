import {
  Logger,
  LogLevel,
  Message,
  NotImplementedError,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";
import sha1 from "sha1";

import { IDatabase } from "../Database/IDatabase";
import { WebSocketClient } from "../WebSocket/WebSocketClient";
import { WebSocketServer } from "../WebSocket/WebSocketServer";

import { Bus } from "./Bus";
import { BusDatabase } from "./BusDatabase";
import { BusMessage } from "./BusMessage/BusMessage";
import { BusMessageForCommunication } from "./BusMessage/BusMessageForCommunication";
import { BusMessageForNegotiation } from "./BusMessage/BusMessageForNegotiation";
import { BusMessageJoin } from "./BusMessage/Negotiation/BusMessageJoin";
import { BusNegotiationError } from "./Error/BusNegotiationError";

/**
 * Servidor do Bus.
 */
export class BusServer extends Bus {
  /**
   * Identificador do servidor.
   */
  private static readonly serverId: string = sha1(Math.random().toString());

  /**
   * Dados dos clientes.
   */
  private readonly clientsIds: Map<WebSocketClient, string | undefined> =
    new Map<WebSocketClient, string | undefined>();

  /**
   * Database especializado para o Bus.
   */
  private readonly database: BusDatabase;

  /**
   * Sinaliza que o polling de mensagens está em execução.
   */
  private dispatchPendingMessagesIsRunning = false;

  /**
   * Lista de clientes com mensagens pendentes.
   */
  private readonly pendingMessages: Array<[WebSocketClient, string]> = [];

  /**
   * Construtor.
   * @param webSocketServer Servidor websocket.
   * @param databaseServer Servidor do banco de dados.
   */
  public constructor(
    private readonly webSocketServer: WebSocketServer,
    databaseServer: IDatabase
  ) {
    super(true);

    this.database = new BusDatabase(databaseServer);
    this.database.onMessageReceived.add(
      this.handleListenerNotifications.bind(this)
    );

    webSocketServer.onConnection.add(
      this.handleWebSocketServerConnection.bind(this)
    );
    webSocketServer.clients.forEach((client) =>
      this.handleWebSocketServerConnection(client)
    );

    Message.subscribe(BusMessageJoin, this.handleBusMessageJoin.bind(this));
  }

  /**
   * Handle: Mensagem do bus,
   */
  protected override async handleBusMessage(
    busMessage: BusMessage,
    client: WebSocketClient
  ): Promise<void> {
    if (!busMessage.clientId) {
      throw new ShouldNeverHappenError();
    }

    const clientId = this.clientsIds.get(client);
    const clientIdChanged =
      clientId !== undefined && clientId !== busMessage.clientId;
    if (clientIdChanged) {
      throw new BusNegotiationError(
        "Client id was changed from {previous} to {actual}.".querystring({
          actual: busMessage.clientId,
          previous: clientId,
        })
      );
    }

    if (busMessage instanceof BusMessageForNegotiation) {
      busMessage.client = client;
      busMessage.delivered = (await busMessage.sendAsync()).rounds > 0;
    } else if (busMessage instanceof BusMessageForCommunication) {
      busMessage.delivered = await this.database.postMessage(busMessage);
    } else {
      throw new NotImplementedError("Unknown category of message bus.");
    }
  }

  /**
   * Obtem e envia as mensagens pendentes.
   */
  private dispatchPendingMessages(): void {
    const run = async () => {
      const clientData = this.pendingMessages.shift();

      if (!clientData) {
        this.dispatchPendingMessagesIsRunning = false;

        return;
      }

      const client = clientData[0];
      const clientId = clientData[1];

      const rawMessages = await this.database.getMessages(clientId);
      rawMessages.forEach((rawMessage) => client.send(rawMessage));

      setImmediate(run);
    };

    if (!this.dispatchPendingMessagesIsRunning) {
      this.dispatchPendingMessagesIsRunning = true;
      void run();
    }
  }

  /**
   * Mensagem: BusMessageJoin
   */
  private async handleBusMessageJoin(
    busMessage: BusMessageJoin
  ): Promise<void> {
    if (busMessage.channels.length !== 1) {
      throw new BusNegotiationError(
        `Expected a unique channel name, but found {channelCount}: {channelNames}`.querystring(
          {
            channelCount: busMessage.channels.length,
            channelNames: busMessage.channels
              .map((channel) => `"${channel}"`)
              .join(", "),
          }
        )
      );
    }

    const channelName = busMessage.channels[0];
    const isValidChannel = /^\w+$/.test(channelName);
    if (!isValidChannel) {
      throw new BusNegotiationError(
        'Invalid channel name "{channelName}".'.querystring({
          channelName,
        })
      );
    }

    if (busMessage.client === undefined) {
      throw new ShouldNeverHappenError();
    }

    const alreadyJoined = this.clientsIds.get(busMessage.client) !== undefined;
    if (alreadyJoined) {
      throw new BusNegotiationError("The client has already joined.");
    }

    await this.database.clientJoin(
      BusServer.serverId,
      busMessage.clientId,
      channelName
    );
    this.clientsIds.set(busMessage.client, busMessage.clientId);

    Logger.post(
      'A "{clientId}" client has joined "{channel}" channel.',
      { clientId: busMessage.clientId, channel: busMessage.channels },
      LogLevel.Debug,
      BusServer.name
    );
  }

  /**
   * Handle: Mensagem recebida do bus.
   * @param clientId Cliente que recebeu mensagem.
   */
  private handleListenerNotifications(clientId: string): void {
    const client = (Array.from(this.clientsIds.entries()).find(
      (entry) => entry[1] === clientId
    ) ?? [])[0];

    if (!client) {
      Logger.post(
        'Received a notification for a non-existent "{clientId}" client.',
        { clientId },
        LogLevel.Warning,
        BusServer.name
      );

      return;
    }

    const notIncluded =
      this.pendingMessages.findIndex((clientData) =>
        Object.is(clientData[0], client)
      ) < 0;
    if (notIncluded) {
      this.pendingMessages.push([client, clientId]);
      this.dispatchPendingMessages();
    }
  }

  /**
   * Handle: Cliente fechou.
   */
  private async handleWebSocketClientClose(
    client: WebSocketClient,
    code: number,
    reason: string
  ): Promise<void> {
    const clientId = this.clientsIds.get(client);
    if (clientId !== undefined) {
      await this.database.clientLeave(clientId);
    }
    this.clientsIds.delete(client);

    Logger.post(
      'A client connection was closed. {clientId} Reason: {code}, "{reason}".',
      {
        clientId: clientId
          ? `Client id "${clientId}".`
          : "Client id unknown because no message was ever received.",
        code,
        reason,
      },
      LogLevel.Debug,
      BusServer.name
    );
  }

  /**
   * Handle: uma conexão de cliente foi recebida no servidor.
   */
  private handleWebSocketServerConnection(client: WebSocketClient): void {
    this.clientsIds.set(client, undefined);
    client.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    client.onClose.add(this.handleWebSocketClientClose.bind(this));
  }
}

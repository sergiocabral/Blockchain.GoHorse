import {
  Logger,
  LogLevel,
  Message,
  NotImplementedError,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";

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
   * Dados dos clientes.
   */
  private readonly clientsIds: Map<WebSocketClient, string | undefined> =
    new Map<WebSocketClient, string | undefined>();

  /**
   * Database especializado para o Bus.
   */
  private readonly database: BusDatabase;

  /**
   * Construtor.
   * @param webSocketServer Servidor websocket.
   * @param databaseServer Servidor do banco de dados.
   */
  public constructor(
    private readonly webSocketServer: WebSocketServer,
    databaseServer: IDatabase
  ) {
    super();

    this.database = new BusDatabase(databaseServer);
    this.database.onMessageReceived.add(this.handleListenerNotifications.bind(this));

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
      await busMessage.sendAsync();
    } else if (busMessage instanceof BusMessageForCommunication) {
      await this.database.postMessage(busMessage);
    } else {
      throw new NotImplementedError("Unknown category of message bus.");
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

    await this.database.clientJoin(busMessage.clientId, channelName);
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
   * @param rawMessage Mensagem do bus como texto.
   */
  private handleListenerNotifications(rawMessage: string): void {
    // TODO: implementar.
    const busMessage = this.decode(rawMessage);
    Logger.post(`${busMessage?.type} : ${rawMessage}`);
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
      "A client connection was closed. {clientId} Reason: {code}, {reason}",
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

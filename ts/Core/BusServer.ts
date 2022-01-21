import {
  Logger,
  LogLevel,
  Message,
  NotImplementedError,
  ShouldNeverHappenError
} from '@sergiocabral/helper';
import sha1 from 'sha1';

import { Bus } from './Bus';
import { BusDatabase } from './BusDatabase';
import { BusDatabaseResult } from './BusDatabaseResult';
import { BusMessage } from '../BusMessage/BusMessage';
import { BusMessageForCommunication } from '../BusMessage/BusMessageForCommunication';
import { BusMessageForNegotiation } from '../BusMessage/BusMessageForNegotiation';
import { BusMessageJoin } from '../BusMessage/Negotiation/BusMessageJoin';
import { BusMessagePing } from '../BusMessage/Negotiation/BusMessagePing';
import { BusNegotiationError } from '../Error/BusNegotiationError';
import { IBusClientData } from './IBusClientData';
import { WebSocketClient, WebSocketServer } from '@gohorse/npm-websocket';
import { IDatabase } from '@gohorse/npm-bus-database';

/**
 * Servidor do Core.
 */
export class BusServer extends Bus {
  /**
   * Identificador do servidor.
   */
  private static readonly serverId: string = sha1(Math.random().toString());

  /**
   * Dados dos clientes.
   */
  private readonly clientsData: Map<
    WebSocketClient,
    IBusClientData | undefined
  > = new Map<WebSocketClient, IBusClientData | undefined>();

  /**
   * Database especializado para o Core.
   */
  private readonly databaseValue: BusDatabase;

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

    this.databaseValue = new BusDatabase(databaseServer);
    this.database.onMessageReceived.add(
      this.handleListenerNotifications.bind(this)
    );

    webSocketServer.onConnection.add(
      this.handleWebSocketServerConnection.bind(this)
    );
    webSocketServer.clients.forEach(client =>
      this.handleWebSocketServerConnection(client)
    );

    Message.subscribe(BusMessageJoin, this.handleBusMessageJoin.bind(this));
    Message.subscribe(BusMessagePing, this.handleBusMessagePing.bind(this));
  }

  /**
   * Database especializado para o Core.
   */
  public override get database(): BusDatabase {
    return this.databaseValue;
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

    const clientData = this.clientsData.get(client);
    const clientIdChanged =
      clientData !== undefined && clientData.id !== busMessage.clientId;
    if (clientIdChanged) {
      throw new BusNegotiationError(
        'Client id was changed from {previous} to {actual}.'.querystring({
          actual: busMessage.clientId,
          previous: clientData
        })
      );
    }

    if (busMessage instanceof BusMessageForNegotiation) {
      busMessage.client = client;
      const {
        rounds,
        message: { response }
      } = await busMessage.sendAsync();
      if (response !== undefined) {
        response.clientId = busMessage.clientId;
        client.send(this.encode(response));
      }
      busMessage.delivered = rounds > 0;
    } else if (busMessage instanceof BusMessageForCommunication) {
      const postResult = await this.database.postMessage(busMessage);
      busMessage.delivered =
        postResult === BusDatabaseResult.Success ||
        postResult === BusDatabaseResult.AlreadyHandled;
    } else {
      throw new NotImplementedError('Unknown category of message bus.');
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
      rawMessages.forEach(rawMessage => client.send(rawMessage));

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
              .map(channel => `"${channel}"`)
              .join(', ')
          }
        )
      );
    }

    const channelName = busMessage.channels[0];
    const isValidChannel = /^\w+$/.test(channelName);
    if (!isValidChannel) {
      throw new BusNegotiationError(
        'Invalid channel name "{channelName}".'.querystring({
          channelName
        })
      );
    }

    if (busMessage.client === undefined) {
      throw new ShouldNeverHappenError();
    }

    const alreadyJoined = this.clientsData.get(busMessage.client) !== undefined;
    if (alreadyJoined) {
      throw new BusNegotiationError('The client has already joined.');
    }

    await this.database.clientJoin(
      BusServer.serverId,
      busMessage.clientId,
      channelName
    );

    this.clientsData.set(busMessage.client, {
      channel: channelName,
      id: busMessage.clientId
    });

    Logger.post(
      'A "{clientId}" client has joined "{channel}" channel.',
      { clientId: busMessage.clientId, channel: busMessage.channels },
      LogLevel.Debug,
      BusServer.name
    );
  }

  /**
   * Mensagem: BusMessagePing
   */
  private async handleBusMessagePing(
    busMessage: BusMessagePing
  ): Promise<void> {
    if (busMessage.channels.length > 0) {
      throw new BusNegotiationError(
        `Expected no channel name, but found {channelCount}: {channelNames}`.querystring(
          {
            channelCount: busMessage.channels.length,
            channelNames: busMessage.channels
              .map(channel => `"${channel}"`)
              .join(', ')
          }
        )
      );
    }

    if (busMessage.client === undefined) {
      throw new ShouldNeverHappenError();
    }

    const clientsData = this.clientsData.get(busMessage.client);
    const didNotJoin = clientsData === undefined;
    if (didNotJoin) {
      throw new BusNegotiationError('The client did not join.');
    }

    if (busMessage.clientId !== clientsData.id) {
      throw new BusNegotiationError(
        `Client id "${busMessage.clientId}" does not match expected.`
      );
    }

    await this.database.clientPing(
      BusServer.serverId,
      clientsData.id,
      clientsData.channel
    );

    Logger.post(
      'Receive PING from "{clientId}" client.',
      { clientId: busMessage.clientId },
      LogLevel.Verbose,
      BusServer.name
    );
  }

  /**
   * Handle: Mensagem recebida do bus.
   * @param clientId Cliente que recebeu mensagem.
   */
  private handleListenerNotifications(clientId: string): void {
    const client = (Array.from(this.clientsData.entries()).find(
      entry => entry[1]?.id === clientId
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
      this.pendingMessages.findIndex(clientData =>
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
    const clientData = this.clientsData.get(client);
    if (clientData !== undefined) {
      await this.database.clientLeave(clientData.id);
    }
    this.clientsData.delete(client);

    Logger.post(
      'A client connection was closed. {clientId} Reason: {code}, "{reason}".',
      {
        clientId: clientData
          ? `Client id "${clientData.id}".`
          : 'Client id unknown because no message was ever received.',
        code,
        reason
      },
      LogLevel.Debug,
      BusServer.name
    );
  }

  /**
   * Handle: uma conexão de cliente foi recebida no servidor.
   */
  private handleWebSocketServerConnection(client: WebSocketClient): void {
    this.clientsData.set(client, undefined);
    client.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    client.onClose.add(this.handleWebSocketClientClose.bind(this));
  }
}
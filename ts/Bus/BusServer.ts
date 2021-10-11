import {
  HelperObject,
  Logger,
  LogLevel,
  Message,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";

import { IDatabase } from "../Database/IDatabase";
import { WebSocketClient } from "../WebSocket/WebSocketClient";
import { WebSocketServer } from "../WebSocket/WebSocketServer";

import { Bus } from "./Bus";
import { BusMessageJoin } from "./BusMessage/BusMessageJoin";
import { BusMessageText } from "./BusMessage/BusMessageText";
import { IBusMessage } from "./BusMessage/IBusMessage";
import { IClientData } from "./IClientData";

/**
 * Servidor do Bus.
 */
export class BusServer extends Bus {
  /**
   * Nome de propriedade para receber a referência do cliente.
   */
  private static readonly propertyNameForClient: symbol = Symbol();

  /**
   * Retorna o cliente websocket associado a uma mensagem.
   */
  private static getClient(busMessage: IBusMessage): WebSocketClient {
    const client = HelperObject.getProperty(
      busMessage,
      BusServer.propertyNameForClient
    );

    if (client === undefined) {
      throw new ShouldNeverHappenError();
    }

    return client as WebSocketClient;
  }

  /**
   * Associa um cliente websocket a uma mensagem.
   */
  private static setClient(
    busMessage: IBusMessage,
    client: WebSocketClient
  ): void {
    HelperObject.setProperty(
      busMessage,
      BusServer.propertyNameForClient,
      client
    );
  }

  /**
   * Dados dos clientes.
   */
  private readonly clientData: Map<WebSocketClient, IClientData> = new Map<
    WebSocketClient,
    IClientData
  >();

  /**
   * Construtor.
   * @param webSocketServer Servidor websocket.
   * @param databaseServer Servidor do banco de dados.
   */
  public constructor(
    private readonly webSocketServer: WebSocketServer,
    private readonly databaseServer: IDatabase
  ) {
    super();
    webSocketServer.onConnection.add(
      this.handleWebSocketServerConnection.bind(this)
    );
    webSocketServer.clients.forEach((client) =>
      this.handleWebSocketServerConnection(client)
    );
    Message.subscribe(BusMessageJoin, this.handleBusMessageJoin.bind(this));
    Message.subscribe(BusMessageText, this.handleBusMessageText.bind(this));
  }

  /**
   * Obtem a lista de clientes com base numa lista de canais.
   */
  private getClients(message: IBusMessage): WebSocketClient[] {
    const self = BusServer.getClient(message);
    const clients = Array<WebSocketClient>();

    for (const entry of this.clientData.entries()) {
      const client = entry[0];
      const data = entry[1];

      if (
        !Object.is(client, self) &&
        (message.channels.includes(data.channel) ||
          message.channels.includes(Bus.ALL_CHANNELS))
      ) {
        clients.push(client);
        break;
      }
    }

    return clients;
  }

  /**
   * Mensagem: BusMessageJoin
   */
  private handleBusMessageJoin(busMessage: BusMessageJoin): void {
    if (busMessage.clientId === undefined) {
      throw new ShouldNeverHappenError();
    }

    if (busMessage.channels.length !== 1) {
      Logger.post(
        'Received message {messageType}@{messageId} from client "{clientId}" is invalid. Expected a unique channel name, but found "{channel}".',
        {
          channel: busMessage.channels.join(", "),
          clientId: busMessage.clientId,
          messageId: busMessage.id,
          messageType: busMessage.type,
        },
        LogLevel.Error,
        BusServer.name
      );

      return;
    }

    const regexValidChannel = /^\w+$/;
    const channel = busMessage.channels[0];
    if (!regexValidChannel.test(channel)) {
      Logger.post(
        'Received message {messageType}@{messageId} from client "{clientId}" is invalid. Invalid channel name "{channel}".',
        {
          channel,
          clientId: busMessage.clientId,
          messageType: busMessage.type,
        },
        LogLevel.Error,
        BusServer.name
      );

      return;
    }

    const client = BusServer.getClient(busMessage);
    this.clientData.set(client, { channel, clientId: busMessage.clientId });

    Logger.post(
      'A "{clientId}" client has joined "{channel}" channel.',
      { clientId: busMessage.clientId, channel: busMessage.channels },
      LogLevel.Debug,
      BusServer.name
    );
  }

  /**
   * Mensagem: BusMessageText
   */
  private handleBusMessageText(message: BusMessageText): void {
    const clients = this.getClients(message);
    clients.forEach((client) => client.send(this.encode(message)));
  }

  /**
   * Handle: Cliente fechou.
   */
  private handleWebSocketClientClose(client: WebSocketClient): void {
    const data = this.clientData.get(client);
    this.clientData.delete(client);

    if (data === undefined) {
      throw new ShouldNeverHappenError();
    }

    Logger.post(
      'A "{clientId}" client has left "{channel}" channel.',
      { clientId: data.clientId, channel: data.channel },
      LogLevel.Debug,
      BusServer.name
    );
  }

  /**
   * Handle: Mensagem recebida.
   */
  private handleWebSocketClientMessage(
    message: string,
    client: WebSocketClient
  ): void {
    // TODO: Implementar banco de dados central

    const busMessage = this.decode(message);
    if (busMessage) {
      BusServer.setClient(busMessage, client);
      this.dispatch(busMessage);
    }
  }

  /**
   * Handle: uma conexão de cliente foi recebida no servidor.
   */
  private handleWebSocketServerConnection(client: WebSocketClient): void {
    client.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    client.onClose.add(this.handleWebSocketClientClose.bind(this));
  }
}

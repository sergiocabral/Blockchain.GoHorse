import {
  Logger,
  LogLevel,
  Message,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";

import { IDatabase } from "../Database/IDatabase";
import { WebSocketClient } from "../WebSocket/WebSocketClient";
import { WebSocketServer } from "../WebSocket/WebSocketServer";

import { Bus } from "./Bus";
import { BusDatabase } from "./BusDatabase";
import { BusMessageJoin } from "./BusMessage/BusMessageJoin";
import { BusMessageText } from "./BusMessage/BusMessageText";
import { IBusMessage } from "./BusMessage/IBusMessage";

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
    webSocketServer.onConnection.add(
      this.handleWebSocketServerConnection.bind(this)
    );
    webSocketServer.clients.forEach((client) =>
      this.handleWebSocketServerConnection(client)
    );
    Message.subscribe(BusMessageJoin, this.handleBusMessageJoin.bind(this));
    Message.subscribe(BusMessageText, this.handleBusMessageText.bind(this));
  }

  //  /**
  //   * Obtem a lista de clientes com base numa lista de canais.
  //   */
  //  private getClients(message: IBusMessage): WebSocketClient[] {
  //    const self = BusServer.getClient(message);
  //    const clients = Array<WebSocketClient>();
  //
  //    for (const entry of this.clientData.entries()) {
  //      const client = entry[0];
  //      const data = entry[1];
  //
  //      if (
  //        !Object.is(client, self) &&
  //        (message.channels.includes(data.channel) ||
  //          message.channels.includes(Bus.ALL_CHANNELS))
  //      ) {
  //        clients.push(client);
  //      }
  //    }
  //
  //    return clients;
  //  }

  /**
   * Mensagem: BusMessageJoin
   */
  private async handleBusMessageJoin(
    busMessage: BusMessageJoin
  ): Promise<void> {
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

    await this.database.clientJoin(busMessage.clientId, channel);

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
  private async handleBusMessageText(message: BusMessageText): Promise<void> {
    await this.database.postMessage(message);

    // TODO: Após enviar preciso receber de algum jeito as mensagens.

    // const clients = this.getClients(message);
    // clients.forEach((client) => client.send(this.encode(message)));
  }

  /**
   * Handle: Cliente fechou.
   */
  private async handleWebSocketClientClose(
    client: WebSocketClient
  ): Promise<void> {
    const clientId = this.clientsIds.get(client);
    if (clientId !== undefined) {
      await this.database.clientLeave(clientId);
    }
    this.clientsIds.delete(client);

    Logger.post(
      "A client connection was closed. {clientId}",
      {
        clientId: clientId
          ? `Client id "${clientId}".`
          : "Client id unknown because no message was ever received.",
      },
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
    const busMessage = this.decode(message);
    if (busMessage) {
      if (busMessage.clientId) {
        let clientId = this.clientsIds.get(client);
        if (clientId === undefined) {
          clientId = busMessage.clientId;
          this.clientsIds.set(client, clientId);
        }

        if (busMessage.clientId === clientId) {
          this.dispatch(busMessage);
        } else {
          Logger.post(
            "A message was ignored because the client id was changed from {previous} to {actual}.",
            {
              actual: busMessage.clientId,
              previous: clientId,
            },
            LogLevel.Warning,
            BusServer.name
          );
        }
      } else {
        Logger.post(
          "A message was ignored because it has no client id.",
          undefined,
          LogLevel.Warning,
          BusServer.name
        );
      }
    }
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

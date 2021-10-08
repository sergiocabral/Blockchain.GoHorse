import {
  HelperObject,
  Logger,
  LogLevel,
  Message,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";

import { WebSocketClient } from "../WebSocket/WebSocketClient";
import { WebSocketServer } from "../WebSocket/WebSocketServer";

import { Bus } from "./Bus";
import { BusMessageJoin } from "./BusMessage/BusMessageJoin";
import { BusMessageText } from "./BusMessage/BusMessageText";
import { IBusMessage } from "./BusMessage/IBusMessage";
import { IBusMessageParse } from "./BusMessage/IBusMessageParse";
import { FieldValidator } from "./FieldValidator";
import { IClientData } from "./IClientData";

/**
 * Servidor do Bus.
 */
export class BusServer extends Bus {
  /**
   * Mensagem de erro quando mensagem é inválida.
   */
  private static readonly messageWhenInvalid =
    'Message received of type {messageType} from "{clientId}" client is invalid: {error}';

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
    busMessage: IBusMessage | undefined,
    client: WebSocketClient
  ): void {
    if (busMessage !== undefined) {
      HelperObject.setProperty(
        busMessage,
        BusServer.propertyNameForClient,
        client
      );
    }
  }

  /**
   * Dados dos clientes.
   */
  private readonly clientData: Map<WebSocketClient, IClientData> = new Map<
    WebSocketClient,
    IClientData
  >();

  /**
   * Lista de mensagens do Bus.
   */
  private readonly messages: IBusMessageParse[] = [
    BusMessageJoin,
    BusMessageText,
  ];

  /**
   * Construtor.
   * @param webSocketServer Servidor websocket.
   */
  public constructor(private readonly webSocketServer: WebSocketServer) {
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
   * Envia uma mensagem broadcast para todos os clientes.
   * @param message Mensagem
   * @returns Total de clientes que receberam a mensagem
   */
  public send(message: IBusMessage): number {
    const messageEncoded = this.encode(message);

    let clients = 0;
    for (const client of this.webSocketServer.clients) {
      client.send(messageEncoded);
      clients += 1;
    }

    return clients;
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
    const client = BusServer.getClient(busMessage);

    if (busMessage.clientId === undefined) {
      throw new ShouldNeverHappenError();
    }

    if (busMessage.channels.length !== 1) {
      Logger.post(
        BusServer.messageWhenInvalid,
        {
          clientId: busMessage.clientId,
          error:
            'expected a unique channel name, but found "{channel}".'.querystring(
              {
                channel: busMessage.channels.join(", "),
              }
            ),
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
        BusServer.messageWhenInvalid,
        {
          clientId: busMessage.clientId,
          error: 'invalid channel name "{channel}".'.querystring({ channel }),
          messageType: busMessage.type,
        },
        LogLevel.Error,
        BusServer.name
      );

      return;
    }

    this.clientData.set(client, { channel, clientId: busMessage.clientId });

    Logger.post(
      'A "{client}" client has joined "{channel}" channel.',
      { client: busMessage.clientId, channel: busMessage.channels },
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
      'A "{client}" client has left "{channel}" channel.',
      { client: data.clientId, channel: data.channel },
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
    BusServer.setClient(busMessage, client);
    this.messages.forEach((messageType) => {
      const busMessageParsed = messageType.parse(busMessage);

      if (busMessageParsed) {
        if (FieldValidator.clientId(busMessageParsed)) {
          void busMessageParsed.sendAsync();
        } else {
          Logger.post(
            BusServer.messageWhenInvalid,
            {
              clientId: busMessageParsed.clientId,
              error: "invalid client id.",
              messageType: busMessageParsed.type,
            },
            LogLevel.Error,
            BusServer.name
          );
        }
      }
    });
  }

  /**
   * Handle: uma conexão de cliente foi recebida no servidor.
   */
  private handleWebSocketServerConnection(client: WebSocketClient): void {
    client.onMessage.add(this.handleWebSocketClientMessage.bind(this));
    client.onClose.add(this.handleWebSocketClientClose.bind(this));
  }
}

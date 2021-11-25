import { HelperObject, Logger, LogLevel } from "@sergiocabral/helper";

import { ProtocolError } from "../WebSocket/Protocol/ProtocolError";
import { WebSocketClient } from "../WebSocket/WebSocketClient";

import { BusMessage } from "./BusMessage/BusMessage";
import { BusMessageText } from "./BusMessage/Communication/BusMessageText";
import { BusMessageUndelivered } from "./BusMessage/Communication/BusMessageUndelivered";
import { IBusMessageParse } from "./BusMessage/IBusMessageParse";
import { BusMessageJoin } from "./BusMessage/Negotiation/BusMessageJoin";
import { IBusMessageAppender } from "./IBusMessageAppender";

/**
 * Classe base para Client e Server.
 */
export abstract class Bus {
  /**
   * Regex para match com qualquer canal.
   */
  public static readonly ALL_CHANNELS = "*";

  /**
   * Mensagens possíveis de serem tratadas.
   */
  private readonly messagesTypes: IBusMessageParse[] = [
    BusMessageText,
    BusMessageJoin,
    BusMessageUndelivered,
  ];

  /**
   * Construtor.
   * @param isServer A instância é um servidor.
   * @param busMessageAppender Criação de mensagens para o Bus
   */
  protected constructor(
    private readonly isServer: boolean,
    private readonly busMessageAppender?: IBusMessageAppender
  ) {}

  /**
   * Decodifica uma string para ser tratada com um objeto IBusMessage
   */
  protected decode(message: unknown): BusMessage | undefined {
    let messageAsObject: unknown;

    if (typeof message === "object" && message) {
      messageAsObject = message;
    } else if (typeof message === "string") {
      try {
        messageAsObject = JSON.parse(message);
      } catch (error) {
        return undefined;
      }
    } else {
      return undefined;
    }

    let messagesTypes = Array<IBusMessageParse>().concat(this.messagesTypes);

    if (this.busMessageAppender !== undefined) {
      messagesTypes = messagesTypes.concat(
        this.busMessageAppender.messagesTypes
      );
    }

    return messagesTypes.reduce<BusMessage | undefined>(
      (instance, messageType) =>
        instance ? instance : messageType.parse(messageAsObject),
      undefined
    );
  }

  /**
   * Codifica uma mensagem para ser enviada como string.
   */
  protected encode(message: BusMessage): string {
    return JSON.stringify(message);
  }

  /**
   * Handle: Mensagem do bus recebida
   */
  protected abstract handleBusMessage(
    busMessage: BusMessage,
    client: WebSocketClient
  ): Promise<void>;

  /**
   * Handle: Mensagem pura recebida do websocket.
   */
  protected async handleWebSocketClientMessage(
    message: string,
    client: WebSocketClient
  ): Promise<void> {
    const busMessage = this.decode(message);

    if (busMessage instanceof BusMessageUndelivered) {
      if (this.isServer) {
        return;
      }

      const undeliveredMessage = this.decode(busMessage.undeliveredMessage);
      HelperObject.setProperty(
        busMessage,
        "undeliveredMessage",
        undeliveredMessage
      );
    }

    if (!busMessage) {
      return;
    }

    Logger.post(
      'The {messageType}@{messageId} message was received from "{clientId}" client.',
      {
        clientId: busMessage.clientId,
        messageId: busMessage.id,
        messageType: busMessage.type,
      },
      LogLevel.Verbose,
      Bus.name
    );

    try {
      await this.handleBusMessage(busMessage, client);
      if (!busMessage.delivered && this.isServer) {
        client.send(this.encode(new BusMessageUndelivered(busMessage)));
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      Logger.post(
        'The {messageType}@{messageId} message caused the "{clientId}" client to disconnect. {errorMessage}',
        {
          clientId: busMessage.clientId,
          errorMessage,
          messageId: busMessage.id,
          messageType: busMessage.type,
        },
        LogLevel.Warning,
        Bus.name
      );

      await client.close(ProtocolError.TOP_LAYER_ERROR, errorMessage);
    }
  }
}

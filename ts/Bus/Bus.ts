import {
  HelperObject,
  Logger,
  LogLevel,
  Message,
  NotReadyError,
} from "@sergiocabral/helper";

import { ProtocolError } from "../WebSocket/Protocol/ProtocolError";
import { WebSocketClient } from "../WebSocket/WebSocketClient";

import { BusDatabase } from "./BusDatabase";
import { BusMessage } from "./BusMessage/BusMessage";
import { BusMessageText } from "./BusMessage/Communication/BusMessageText";
import { BusMessageUndelivered } from "./BusMessage/Communication/BusMessageUndelivered";
import { IBusMessageParse } from "./BusMessage/IBusMessageParse";
import { BusMessageJoin } from "./BusMessage/Negotiation/BusMessageJoin";
import { AttachMessagesToBus } from "./Message/AttachMessagesToBus";

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
   */
  protected constructor(private readonly isServer: boolean) {
    Message.subscribe(
      AttachMessagesToBus,
      this.handleAttachMessagesToBus.bind(this)
    );
  }

  /**
   * Database especializado para o Bus.
   */
  public get database(): BusDatabase {
    throw new NotReadyError("The BusDatabase is not available");
  }

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

    return this.messagesTypes.reduce<BusMessage | undefined>(
      (instance, messageType) =>
        instance ? instance : messageType.parse(messageAsObject),
      undefined
    );
  }

  /**
   * Codifica uma mensagem para ser enviada como string.
   */
  protected encode(message: BusMessage): string {
    return HelperObject.toText(message, 0);
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

      const undeliveredMessage = this.decode(busMessage.message);

      if (undeliveredMessage === undefined) {
        Logger.post(
          'A message was not delivered but its contents were not returned. The {messageType}@{messageId} message was received from "{clientId}" client.',
          {
            clientId: busMessage.clientId,
            messageId: busMessage.id,
            messageType: busMessage.type,
          },
          LogLevel.Warning,
          Bus.name
        );

        return;
      }

      undeliveredMessage.clientId = undefined;
      busMessage.message = undeliveredMessage;
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
      if (this.isServer && !busMessage.delivered) {
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

  /**
   * Handle: AppendBusMessage
   */
  private handleAttachMessagesToBus(message: AttachMessagesToBus): void {
    this.messagesTypes.push(...message.messagesTypes);
  }
}

import { Logger, LogLevel } from "@sergiocabral/helper";

import { ProtocolError } from "../WebSocket/Protocol/ProtocolError";
import { WebSocketClient } from "../WebSocket/WebSocketClient";

import { BusMessage } from "./BusMessage/BusMessage";
import { BusMessageText } from "./BusMessage/Communication/BusMessageText";
import { IBusMessageParse } from "./BusMessage/IBusMessageParse";
import { BusMessageJoin } from "./BusMessage/Negotiation/BusMessageJoin";

/**
 * Classe base para Client e Server.
 */
export abstract class Bus {
  /**
   * Regex para match com qualquer canal.
   */
  public static readonly ALL_CHANNELS = "*";

  /**
   * Lista de mensagens do Bus.
   */
  protected readonly messagesTypes: IBusMessageParse[] = [
    BusMessageJoin,
    BusMessageText,
  ];

  /**
   * Decodifica uma string para ser tratada com um objeto IBusMessage
   */
  protected decode(message: string): BusMessage | undefined {
    let busMessage: unknown;
    try {
      busMessage = JSON.parse(message);
    } catch (error) {
      return undefined;
    }

    return this.messagesTypes.reduce<BusMessage | undefined>(
      (instance, messageType) =>
        instance ? instance : messageType.parse(busMessage),
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

      client.close(ProtocolError.TOP_LAYER_ERROR, errorMessage);
    }
  }
}

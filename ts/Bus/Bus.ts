import { Logger, LogLevel } from "@sergiocabral/helper";

import { BusMessage } from "./BusMessage/BusMessage";
import { BusMessageJoin } from "./BusMessage/BusMessageJoin";
import { BusMessageText } from "./BusMessage/BusMessageText";
import { IBusMessage } from "./BusMessage/IBusMessage";
import { IBusMessageParse } from "./BusMessage/IBusMessageParse";
import { FieldValidator } from "./FieldValidator";

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
  protected readonly all: IBusMessageParse[] = [BusMessageJoin, BusMessageText];

  /**
   * Decodifica uma string para ser tratada com um objeto IBusMessage
   */
  public decode(message: string): IBusMessage | undefined {
    let instance: unknown;
    try {
      instance = JSON.parse(message);
    } catch (error) {
      Logger.post(
        "Error when Bus tried to decode the message: {error}",
        { error },
        LogLevel.Error,
        Bus.name
      );

      return undefined;
    }

    return BusMessage.parse(instance);
  }

  /**
   * Codifica uma mensagem para ser enviada como string.
   */
  public encode(message: IBusMessage): string {
    return JSON.stringify(message);
  }

  /**
   * Despacha uma mensagem do bus.
   */
  protected dispatch(busMessage: IBusMessage): void {
    this.all.forEach((messageType) => {
      const busMessageParsed = messageType.parse(busMessage);

      if (busMessageParsed) {
        if (FieldValidator.clientId(busMessageParsed)) {
          void busMessageParsed.sendAsync();
        } else {
          Logger.post(
            'Message received of type {messageType} from "{clientId}" client is invalid. Invalid client id.',
            {
              clientId: busMessageParsed.clientId,
              messageType: busMessageParsed.type,
            },
            LogLevel.Error,
            Bus.name
          );
        }
      }
    });
  }
}

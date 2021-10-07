import { Logger, LogLevel } from "@sergiocabral/helper";

import { BusMessage } from "./BusMessage/BusMessage";
import { IBusMessage } from "./BusMessage/IBusMessage";

/**
 * Classe base para Client e Server.
 */
export abstract class Bus {
  /**
   * Regex para match com qualquer canal.
   */
  public static readonly ALL_CHANNELS = /.*/;

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
}

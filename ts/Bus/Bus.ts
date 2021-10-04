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
    try {
      // TODO: Garantir que o texto de entrada seja a classe de saída.
      return JSON.parse(message) as IBusMessage;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Codifica uma mensagem para ser enviada como string.
   */
  public encode(message: IBusMessage): string {
    return JSON.stringify(message);
  }
}

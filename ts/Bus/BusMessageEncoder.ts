import { IBusMessage } from "./BusMessage/IBusMessage";

/**
 * Responsável por codificar e decodificar uma mensagem.
 */
export class BusMessageEncoder {
  /**
   * Decodifica uma string para ser tratada com um objeto IBusMessage
   */
  public static decode(message: string): IBusMessage | undefined {
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
  public static encode(message: IBusMessage): string {
    return JSON.stringify(message);
  }
}

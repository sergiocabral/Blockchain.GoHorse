import { Message } from "@sergiocabral/helper";

/**
 * Websocket recebeu uma mensagem.
 */
export abstract class WebSocketMessageReceived<TInstance> extends Message {
  /**
   * Construtor.
   * @param instance Instância que gerou a mensagem.
   * @param message Mensagem.
   */
  public constructor(
    public readonly instance: TInstance,
    public readonly message: string
  ) {
    super();
  }
}
